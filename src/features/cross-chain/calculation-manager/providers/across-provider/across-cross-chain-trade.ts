import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { AccrossCcrSupportedChains } from './constants/across-ccr-supported-chains';
import { acrossContractAddresses } from './constants/across-contract-addresses';
import { acrossDepositAbi, acrossFundsDepositedInputs } from './constants/across-deposit-abi';
import { AcrossFeeQuoteRequestParams, AcrossFeeQuoteResponse } from './models/across-fee-quote';
import { AcrossApiService } from './services/across-api-service';

export class AcrossCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        providerAddress: string,
        acrossFeeQuoteRequestParams: AcrossFeeQuoteRequestParams
    ): Promise<GasData | null> {
        try {
            const trade = new AcrossCrossChainTrade(
                {
                    from,
                    to,
                    priceImpact: 0,
                    toTokenAmountMin: new BigNumber(0),
                    gasData: null,
                    feeInfo,
                    slippage: 0,
                    acrossFeeQuoteRequestParams
                },
                providerAddress,
                []
            );

            return getCrossChainGasData(trade);
        } catch (_err) {
            return null;
        }
    }

    private readonly uniqCodeWithSeparator = '1dc0de003c';

    public acrossDepositId = 0;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.ACROSS;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.ACROSS;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    private readonly acrossFeeQuoteRequestParams: AcrossFeeQuoteRequestParams;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    private get fromBlockchain(): AccrossCcrSupportedChains {
        return this.from.blockchain as AccrossCcrSupportedChains;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : acrossContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        ccrTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            toTokenAmountMin: BigNumber;
            priceImpact: number | null;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            slippage: number;
            acrossFeeQuoteRequestParams: AcrossFeeQuoteRequestParams;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = ccrTrade.from;
        this.to = ccrTrade.to;
        this.toTokenAmountMin = ccrTrade.toTokenAmountMin;
        this.priceImpact = ccrTrade.priceImpact;
        this.gasData = ccrTrade.gasData;
        this.feeInfo = ccrTrade.feeInfo;
        this.slippage = ccrTrade.slippage;
        this.acrossFeeQuoteRequestParams = ccrTrade.acrossFeeQuoteRequestParams;
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

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const feeQuote = await AcrossApiService.getFeeQuote({
            ...this.acrossFeeQuoteRequestParams,
            recipient: receiverAddress,
            depositMethod: 'depositV3'
        });

        const toAmount = this.from.weiAmount.minus(feeQuote.totalRelayFee.total);

        const callData = this.getAcrossCallData(feeQuote, toAmount, receiverAddress);

        return { config: callData, amount: toAmount.toFixed() };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    private getAcrossCallData(
        quote: AcrossFeeQuoteResponse,
        toAmount: BigNumber,
        receiverAddress?: string
    ): EvmEncodeConfig {
        const args = [
            this.walletAddress,
            receiverAddress || this.walletAddress,
            this.acrossFeeQuoteRequestParams.inputToken,
            this.acrossFeeQuoteRequestParams.outputToken,
            this.from.stringWeiAmount,
            toAmount.toFixed(),
            this.acrossFeeQuoteRequestParams.destinationChainId.toString(),
            quote.exclusiveRelayer,
            Number(quote.timestamp),
            this.getFillDeadline(),
            Number(quote.exclusivityDeadline),
            '0x'
        ];

        const evmConfig = EvmWeb3Pure.encodeMethodCall(
            acrossContractAddresses[this.fromBlockchain],
            acrossDepositAbi,
            'depositV3',
            args,
            this.from.isNative ? this.from.stringWeiAmount : '0'
        );

        return {
            ...evmConfig,
            data: evmConfig.data + this.uniqCodeWithSeparator
        };
    }

    private getFillDeadline(): number {
        return Math.round(Date.now() / 1000) + 18_000;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );
        const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

        const fromAddress = this.walletAddress;

        const { data, value, to } = await this.encode({ ...options, fromAddress });

        const { onConfirm, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private[method](to, {
                data,
                value,
                onTransactionHash,
                gasPriceOptions,
                gasLimitRatio: this.gasLimitRatio,
                ...(options?.useEip155 && {
                    chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
                })
            });

            const encodedId = await Injector.web3PublicService
                .getWeb3Public(this.fromBlockchain)
                .getTxDecodedData(transactionHash!, acrossFundsDepositedInputs, 'depositId');
            this.acrossDepositId = Number(encodedId);

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }
}
