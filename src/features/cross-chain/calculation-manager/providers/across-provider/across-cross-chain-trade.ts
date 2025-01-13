import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { AccrossCcrSupportedChains } from './constants/across-ccr-supported-chains';
import { acrossContractAddresses } from './constants/across-contract-addresses';
import { acrossDepositAbi } from './constants/across-deposit-abi';
import { AcrossFeeQuoteRequestParams, AcrossFeeQuoteResponse } from './models/across-fee-quote';
import { AcrossApiService } from './services/across-api-service';

export class AcrossCrossChainTrade extends EvmCrossChainTrade {
    private readonly uniqCodeWithSeparator = '1dc0de003c';

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

    private readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

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
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = ccrTrade.from;
        this.to = ccrTrade.to;
        this.toTokenAmountMin = ccrTrade.toTokenAmountMin;
        this.priceImpact = ccrTrade.priceImpact;
        this.gasData = ccrTrade.gasData;
        this.feeInfo = ccrTrade.feeInfo;
        this.slippage = ccrTrade.slippage;
        this.acrossFeeQuoteRequestParams = ccrTrade.acrossFeeQuoteRequestParams;
        this.fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
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

        const toAmount = this.fromWithoutFee.weiAmount.minus(feeQuote.totalRelayFee.total);

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
            this.fromWithoutFee.stringWeiAmount,
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
            this.from.isNative ? this.fromWithoutFee.stringWeiAmount : '0'
        );

        return evmConfig;
    }

    public override async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        const evmEncodeConfig = await super.encode(options);

        return {
            ...evmEncodeConfig,
            data: evmEncodeConfig.data + this.uniqCodeWithSeparator
        };
    }

    private getFillDeadline(): number {
        return Math.round(Date.now() / 1000) + 18_000;
    }
}
