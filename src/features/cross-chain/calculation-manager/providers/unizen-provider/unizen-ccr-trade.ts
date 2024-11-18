import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { UniZenCcrQuoteResponse } from 'src/features/common/providers/unizen/models/cross-chain-models/unizen-ccr-quote-response';
import { UniZenSwapResponse } from 'src/features/common/providers/unizen/models/cross-chain-models/unizen-ccr-swap-response';
import { UniZenCcrQuoteParams } from 'src/features/common/providers/unizen/models/unizen-quote-params';
import { UniZenCcrSwapParams } from 'src/features/common/providers/unizen/models/unizen-swap-params';
import { UniZenApiService } from 'src/features/common/providers/unizen/services/unizen-api-service';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { UniZenCcrSupportedChain } from './constants/unizen-ccr-supported-chains';
import { UniZenCcrUtilsService } from './services/unizen-ccr-utils-service';

export class UniZenCcrTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        providerAddress: string,
        slippage: number,
        unizenContractAddress: string
    ): Promise<GasData | null> {
        try {
            const trade = new UniZenCcrTrade(
                {
                    from,
                    to,
                    feeInfo,
                    gasData: null,
                    slippage,
                    priceImpact: null,
                    contractAddress: unizenContractAddress,
                    toTokenAmountMin: new BigNumber(0)
                },
                providerAddress,
                [],
                false
            );

            return getCrossChainGasData(trade);
        } catch (_err) {
            return null;
        }
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly feeInfo: FeeInfo;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.UNIZEN;

    public readonly gasData: GasData | null;

    public readonly toTokenAmountMin: BigNumber;

    public readonly isAggregator = false;

    public readonly slippageTolerance: number;

    public readonly priceImpact: number | null;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.UNIZEN;

    private readonly contractAddress: string;

    constructor(
        ccrTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<BlockchainName>;
            feeInfo: FeeInfo;
            gasData: GasData | null;
            slippage: number;
            priceImpact: number | null;
            contractAddress: string;
            toTokenAmountMin: BigNumber;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = ccrTrade.from;
        this.to = ccrTrade.to;
        this.feeInfo = ccrTrade.feeInfo;
        this.gasData = ccrTrade.gasData;
        this.slippageTolerance = ccrTrade.slippage;
        this.toTokenAmountMin = ccrTrade.toTokenAmountMin;
        this.priceImpact = ccrTrade.priceImpact;
        this.contractAddress = ccrTrade.contractAddress;
    }

    private get fromBlockchain(): UniZenCcrSupportedChain {
        return this.from.blockchain as UniZenCcrSupportedChain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.contractAddress;
    }

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );
        try {
            const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
                walletAddress: this.walletAddress,
                fromTokenAmount: this.from,
                toTokenAmount: this.to,
                toAddress: undefined,
                srcChainTrade: null,
                providerAddress: this.providerAddress,
                type: `native:${this.type}`,
                fromAddress: this.walletAddress
            });

            const fromWithoutFee = getFromWithoutFee(
                this.from,
                this.feeInfo.rubicProxy?.platformFee?.percent
            );
            const extraNativeFee = this.from.isNative
                ? new BigNumber(providerValue).minus(fromWithoutFee.stringWeiAmount).toFixed()
                : new BigNumber(providerValue).toFixed();

            const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
                to,
                data,
                this.fromBlockchain as EvmBlockchainName,
                to,
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
        } catch (err) {
            console.log(err?.message);
            throw err;
        }
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const quoteInfo = await this.getQuoteInfo(receiverAddress);

        const swapParams: UniZenCcrSwapParams = {
            transactionData: quoteInfo.transactionData,
            nativeValue: quoteInfo.nativeValue,
            account: this.walletAddress,
            receiver: receiverAddress || this.walletAddress
        };

        const tradeType = 'cross';

        const swapInfo = await UniZenApiService.getSwapInfo<UniZenSwapResponse>(
            swapParams,
            quoteInfo.sourceChainId,
            tradeType
        );

        const evmConfig: EvmEncodeConfig = {
            data: swapInfo.data,
            to: this.contractAddress,
            value: swapInfo.nativeValue
        };

        const toAmount = quoteInfo.transactionData.params.actualQuote;

        return { config: evmConfig, amount: toAmount };
    }

    private async getQuoteInfo(receiverAddress?: string): Promise<UniZenCcrQuoteResponse> {
        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const dstChainId = blockchainId[this.to.blockchain];
        const srcChainId = blockchainId[this.from.blockchain];

        const quoteSendParams: UniZenCcrQuoteParams = {
            fromTokenAddress: this.from.address,
            toTokenAddress: this.to.address,
            sender: this.walletAddress,
            slippage: this.slippageTolerance,
            amount: fromWithoutFee.stringWeiAmount,
            destinationChainId: dstChainId,
            receiver: receiverAddress
        };

        return UniZenCcrUtilsService.getBestQuote(quoteSendParams, srcChainId);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippageTolerance * 100,
            routePath: this.routePath
        };
    }
}
