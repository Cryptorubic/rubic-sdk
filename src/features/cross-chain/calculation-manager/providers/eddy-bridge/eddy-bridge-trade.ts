import BigNumber from 'bignumber.js';
import { UnnecessaryApproveError } from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { ContractParams } from 'src/features/common/models/contract-params';
import { TransactionReceipt } from 'web3-eth';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
    TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS,
    TSS_ADDRESSES_EDDY_BRIDGE
} from './constants/eddy-bridge-contract-addresses';
import {
    EddyBridgeSupportedChain,
    TssAvailableEddyBridgeChain
} from './constants/eddy-bridge-supported-chains';
import { EDDY_BRIDGE_ABI } from './constants/edyy-bridge-abi';
import {
    EddyBridgeGetGasDataParams,
    EddyBridgeTradeConstructorParams
} from './models/eddy-trade-types';
import { EddyBridgeContractService } from './services/eddy-bridge-contract-service';
import { EddyRoutingDirection, ERD } from './utils/eddy-bridge-routing-directions';
export class EddyBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData({
        feeInfo,
        from,
        providerAddress,
        toToken,
        slippage,
        routingDirection
    }: EddyBridgeGetGasDataParams): Promise<GasData | null> {
        const trade = new EddyBridgeTrade({
            crossChainTrade: {
                from,
                to: toToken,
                gasData: null,
                priceImpact: 0,
                feeInfo,
                slippage,
                prevGasAmountInNonZetaChain: new BigNumber(0),
                routingDirection
            },
            providerAddress: providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            routePath: []
        });

        return getCrossChainGasData(trade);
    }

    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.MESON;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;
    /** */

    // used for checkAmountChange in pairs ZetaChain.ETH->Ethreum.ETH & ZetaChain.BNB->Binance.BNB
    private readonly prevGasAmountInNonZetaChain: BigNumber;

    private readonly routingDirection: EddyRoutingDirection;

    private get fromBlockchain(): EddyBridgeSupportedChain {
        return this.from.blockchain as EddyBridgeSupportedChain;
    }

    // EddyFinance has deployed contract only in ZetaChain, other routes go directly via `transfer`
    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    protected override get gasLimitRatio(): number {
        return 1.5;
    }

    constructor(params: EddyBridgeTradeConstructorParams) {
        super(params.providerAddress, params.routePath);
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
        this.prevGasAmountInNonZetaChain = params.crossChainTrade.prevGasAmountInNonZetaChain;
        this.routingDirection = params.crossChainTrade.routingDirection;
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
        let config = {} as EvmEncodeConfig;
        const wrappedZetaAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN]!.address;

        if (this.routingDirection === ERD.ANY_CHAIN_NATIVE_TO_ZETA_NATIVE) {
            const walletAddress = this.walletAddress || FAKE_WALLET_ADDRESS;
            let data =
                EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN +
                walletAddress.slice(2) +
                wrappedZetaAddress.slice(2);

            config = {
                data,
                to: TSS_ADDRESSES_EDDY_BRIDGE[this.fromBlockchain as TssAvailableEddyBridgeChain],
                value: this.from.stringWeiAmount
            };
        } else if (this.routingDirection === ERD.ZETA_NATIVE_TO_ANY_CHAIN_NATIVE) {
            const destZrc20TokenAddress = TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS[this.to.symbol];
            config = EvmWeb3Pure.encodeMethodCall(
                EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
                EDDY_BRIDGE_ABI,
                'transferZetaToConnectedChain',
                ['0x', wrappedZetaAddress, destZrc20TokenAddress],
                this.from.stringWeiAmount
            );
        } else if (this.routingDirection === ERD.ZETA_TOKEN_TO_ANY_CHAIN_NATIVE) {
            const srcZrc20TokenAddress = this.from.address;
            const destZrc20TokenAddress = TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS[this.to.symbol];
            const methodArgs = [
                '0x',
                this.from.stringWeiAmount,
                srcZrc20TokenAddress,
                destZrc20TokenAddress
            ];
            config = EvmWeb3Pure.encodeMethodCall(
                EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
                EDDY_BRIDGE_ABI,
                'withdrawToNativeChain',
                methodArgs,
                '0'
            );
        }

        return {
            config,
            amount: this.to.stringWeiAmount
        };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    protected override async setTransactionConfig(
        skipAmountChangeCheck: boolean,
        useCacheData: boolean,
        receiverAddress?: string
    ): Promise<EvmEncodeConfig> {
        if (this.lastTransactionConfig && useCacheData) {
            return this.lastTransactionConfig;
        }

        const { config, amount } = await this.getTransactionConfigAndAmount(receiverAddress);
        this.lastTransactionConfig = config;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!skipAmountChangeCheck) {
            await this.checkAmountChange(amount, this.amountToCheck);
            if (this.routingDirection === ERD.ZETA_TOKEN_TO_ANY_CHAIN_NATIVE) {
                const newGasAmount = await EddyBridgeContractService.getGasInTargetChain(this.from);
                const prevAmountPlusOnePercent =
                    this.prevGasAmountInNonZetaChain.multipliedBy(1.01);
                if (newGasAmount.gt(prevAmountPlusOnePercent)) {
                    throw new UpdatedRatesError(amount, this.amountToCheck);
                }
            }
        }
        return config;
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
