import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { convertGasDataToBN } from '../../utils/convert-gas-price';
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
import { OwlToSupportedBlockchain } from './constants/owl-to-supported-chains';
import { OwlToGetGasDataParams, OwlToTradeParams } from './models/owl-to-trade-types';

export class OwlToBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData({
        feeInfo,
        fromToken,
        toToken,
        providerAddress,
        gasLimit,
        makerAddress
    }: OwlToGetGasDataParams): Promise<GasData | null> {
        try {
            const trade = new OwlToBridgeTrade({
                crossChainTrade: {
                    feeInfo,
                    from: fromToken,
                    to: toToken,
                    priceImpact: fromToken.calculatePriceImpactPercent(toToken) || 0,
                    gasData: null,
                    makerAddress
                },
                providerAddress,
                routePath: []
            });

            return getCrossChainGasData(trade);
        } catch (_err) {
            const gasDetails = await Injector.gasPriceApi.getGasPrice(fromToken.blockchain);
            const gasDetailsBN = convertGasDataToBN(gasDetails);

            return { gasLimit, ...gasDetailsBN };
        }
    }

    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.OWL_TO_BRIDGE;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.OWL_TO_BRIDGE;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;
    /** */

    /* OwlTo contract address, which gets tokens in source chains and sends them in target chain */
    private makerAddress: string;

    private get fromBlockchain(): OwlToSupportedBlockchain {
        return this.from.blockchain as OwlToSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        // @TODO Add owl-to contract addresses
        return this.isProxyTrade ? rubicProxyContractAddress[this.fromBlockchain].gateway : '';
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor({ crossChainTrade, providerAddress, routePath }: OwlToTradeParams) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.to.tokenAmount;
        this.feeInfo = crossChainTrade.feeInfo;
        this.makerAddress = crossChainTrade.makerAddress;
    }

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
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

        const extraNativeFee = '0';
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data,
            this.from.blockchain,
            providerRouter,
            extraNativeFee
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

    protected async getTransactionConfigAndAmount(_receiverAddress?: string): Promise<{
        config: EvmEncodeConfig;
        amount: string;
    }> {
        const value = this.from.isNative ? this.from.stringWeiAmount : '0';
        const methodArgs = [this.makerAddress, this.from.stringWeiAmount];

        const config = EvmWeb3Pure.encodeMethodCall(
            this.from.address,
            ERC20_TOKEN_ABI,
            'transfer',
            methodArgs,
            value
        );

        return {
            config,
            amount: this.to.stringWeiAmount
        };
    }

    public override async needApprove(): Promise<boolean> {
        if (this.isProxyTrade) {
            return super.needApprove();
        }
        return false;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
