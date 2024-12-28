import BigNumber from 'bignumber.js';
import { UnnecessaryApproveError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { ContractParams } from 'src/features/common/models/contract-params';
import { calculateRates } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/utils/calculate-rates';
import { EddySwapControllerFactory } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/utils/eddy-swap-controller-factory';
import { TransactionReceipt } from 'web3-eth';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    CUSTODY_ADDRESSES,
    EDDY_OMNI_CONTRACT_IN_ZETACHAIN
} from './constants/eddy-bridge-contract-addresses';
import { EddyBridgeSupportedChain } from './constants/eddy-bridge-supported-chains';
import { EddyBridgeTradeConstructorParams } from './models/eddy-trade-types';
import { EddyRoutingDirection, ERD } from './utils/eddy-bridge-routing-directions';

export class EddyBridgeTrade extends EvmCrossChainTrade {
    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.EDDY_BRIDGE;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    private readonly quoteOptions: RequiredCrossChainOptions;

    private readonly routingDirection: EddyRoutingDirection;

    private get fromBlockchain(): EddyBridgeSupportedChain {
        return this.from.blockchain as EddyBridgeSupportedChain;
    }

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) return rubicProxyContractAddress[this.fromBlockchain].gateway;

        switch (this.routingDirection) {
            case ERD.ANY_CHAIN_TOKEN_TO_ANY_CHAIN_TOKEN:
            case ERD.ANY_CHAIN_TOKEN_TO_ZETA_TOKEN:
                return CUSTODY_ADDRESSES[this.fromBlockchain]!;
            case ERD.ZETA_TOKEN_TO_ANY_CHAIN_ALL:
                return EDDY_OMNI_CONTRACT_IN_ZETACHAIN;
            default:
                return EDDY_OMNI_CONTRACT_IN_ZETACHAIN;
        }
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: EddyBridgeTradeConstructorParams) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.slippage = params.crossChainTrade.slippage;
        this.toTokenAmountMin = Web3Pure.fromWei(
            this.to.weiAmountMinusSlippage(this.slippage),
            this.to.decimals
        );
        this.routingDirection = params.crossChainTrade.routingDirection;
        this.quoteOptions = params.crossChainTrade.quoteOptions;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress || this.walletAddress
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: receiverAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `native:${this.bridgeType}`,
            fromAddress: this.walletAddress
        });

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data,
            this.from.blockchain,
            providerRouter,
            '0'
        );

        const methodArguments = [bridgeData, providerData];
        const value = this.getSwapValue(providerValue);
        const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            evmCommonCrossChainAbi,
            this.methodName,
            methodArguments,
            value
        );

        const sendingToken = this.from.isNative ? [] : [this.from.address];
        const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
            contractAbi: gatewayRubicCrossChainAbi,
            methodName: 'startViaRubic',
            methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
            value
        };
    }

    protected async getTransactionConfigAndAmount(
        _receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const evmConfig = EddySwapControllerFactory.createController(
            this.from,
            this.to,
            this.walletAddress || FAKE_WALLET_ADDRESS,
            this.routingDirection
        ).getEvmConfig();

        const outputAmount = await calculateRates(this.from, this.to, this.slippage);

        return {
            config: evmConfig,
            amount: outputAmount
        };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    public override async needApprove(): Promise<boolean> {
        this.checkWalletConnected();
        if (this.from.isNative) return false;

        const allowance = await this.fromWeb3Public.getAllowance(
            this.from.address,
            this.walletAddress,
            this.fromContractAddress
        );
        // need allowance = amount + 1 wei at least
        return this.from.weiAmount.gte(allowance);
    }

    public override async approve(
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true,
        amount: BigNumber = new BigNumber(0)
    ): Promise<TransactionReceipt> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }
        this.checkWalletConnected();
        await this.checkBlockchainCorrect();
        // because of error on EddyBridge contract(they check on allowance > amount instead of allowance >= amount)
        const approveAmount = amount.plus(1);

        return this.web3Private.approveTokens(
            this.from.address,
            this.fromContractAddress,
            approveAmount,
            options
        );
    }
}
