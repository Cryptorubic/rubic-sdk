import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, TooLowAmountError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { SolanaCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/solana-cross-chain-trade/solana-cross-chain-trade';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { DebridgeSolanaCrossChainTradeConstructor } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/debridge-cross-chain-trade-constructor';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { DlnSolanaTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class DebridgeSolanaCrossChainTrade extends SolanaCrossChainTrade {
    protected useProxyByDefault = false;

    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly maxTheoreticalAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly transactionRequest: TransactionRequest;

    private readonly slippage: number;

    // private readonly onChainTrade: EvmOnChainTrade | null;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public readonly isAggregator = false;

    public readonly onChainSubtype = {
        from: ON_CHAIN_TRADE_TYPE.ONE_INCH,
        to: ON_CHAIN_TRADE_TYPE.ONE_INCH
    };

    public readonly bridgeType = BRIDGE_TYPE.DEBRIDGE;

    public readonly from: PriceTokenAmount<SolanaBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly allowanceTarget: string;

    // public readonly gasData: GasData | null;

    private get fromBlockchain(): DeBridgeCrossChainSupportedBlockchain & SolanaBlockchainName {
        return this.from.blockchain as DeBridgeCrossChainSupportedBlockchain & SolanaBlockchainName;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.allowanceTarget;
    }

    public readonly feeInfo: FeeInfo;

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: DebridgeSolanaCrossChainTradeConstructor,
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.transactionRequest = crossChainTrade.transactionRequest;
        // this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.allowanceTarget = crossChainTrade.allowanceTarget || '';
        this.slippage = crossChainTrade.slippage;
        // this.onChainTrade = crossChainTrade.onChainTrade;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.transitAmount = crossChainTrade.transitAmount;
        this.maxTheoreticalAmount = crossChainTrade.maxTheoreticalAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        let transactionHash: string;

        try {
            // throw new Error('Solana is not implemented yet');
            const {
                tx: { data }
            } = await this.getTransactionRequest(
                options?.receiverAddress
                // options?.directTransaction
            );

            const { onConfirm } = options;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

            await this.web3Private.sendTransaction({ data, onTransactionHash });

            return transactionHash!;
        } catch (err) {
            if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
                throw new TooLowAmountError();
            }
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw parseError(err);
        }
    }

    public async getContractParams(
        _options: GetContractParamsOptions,
        _skipAmountChangeCheck: boolean = false
    ): Promise<ContractParams> {
        throw new Error('Solana is not implemented yet');
        // const { tx, fixFee } = await this.getTransactionRequest(
        //     options?.receiverAddress,
        //     options?.directTransaction,
        //     skipAmountChangeCheck
        // );
        // const { data, value: providerValue, to } = tx;
        //
        // const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
        //     walletAddress: this.walletAddress,
        //     fromTokenAmount: this.from,
        //     toTokenAmount: this.to,
        //     srcChainTrade: null,
        //     providerAddress: this.providerAddress,
        //     type: `native:${this.type}`,
        //     fromAddress: this.walletAddress
        // });
        // const swapData =
        //     this.onChainTrade &&
        //     (await ProxyCrossChainEvmTrade.getSwapData(options, {
        //         walletAddress: this.walletAddress,
        //         contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
        //         fromTokenAmount: this.from,
        //         toTokenAmount: this.onChainTrade.to,
        //         onChainEncodeFn: this.onChainTrade.encode.bind(this.onChainTrade)
        //     }));
        // const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
        //     to,
        //     data! as string,
        //     this.fromBlockchain,
        //     this.fromContractAddress,
        //     fixFee
        // );
        //
        // const methodArguments = swapData
        //     ? [bridgeData, swapData, providerData]
        //     : [bridgeData, providerData];
        //
        // const value = this.getSwapValue(providerValue);
        //
        // const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
        //     rubicProxyContractAddress[this.from.blockchain].router,
        //     evmCommonCrossChainAbi,
        //     this.methodName,
        //     methodArguments,
        //     value
        // );
        // const sendingToken = this.from.isNative ? [] : [this.from.address];
        // const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];
        //
        // return {
        //     contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
        //     contractAbi: gatewayRubicCrossChainAbi,
        //     methodName: 'startViaRubic',
        //     methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
        //     value
        // };
    }

    private async getTransactionRequest(
        receiverAddress?: string,
        _transactionConfig?: null,
        _skipAmountChangeCheck: boolean = false
    ): Promise<{
        tx: {
            data: string;
        };
        fixFee: string;
    }> {
        // @TODO SOLANA handle amount change
        // if (transactionConfig) {
        //     return {
        //         tx: {
        //             data: transactionConfig.data,
        //             value: transactionConfig.value,
        //             to: transactionConfig.to
        //         },
        //         fixFee: ''
        //     };
        // }
        const sameChain =
            BlockchainsInfo.getChainType(this.from.blockchain) ===
            BlockchainsInfo.getChainType(this.to.blockchain);
        const walletAddress = this.web3Private.address;
        const params = {
            ...this.transactionRequest,
            ...(receiverAddress && { dstChainTokenOutRecipient: receiverAddress }),
            senderAddress: walletAddress,
            srcChainRefundAddress: walletAddress,
            dstChainOrderAuthorityAddress: sameChain
                ? receiverAddress || walletAddress
                : receiverAddress!,
            srcChainOrderAuthorityAddress: sameChain
                ? receiverAddress || walletAddress
                : walletAddress,
            referralCode: '4350'
        };

        const { tx, fixFee } = await Injector.httpClient.get<DlnSolanaTransactionResponse>(
            `${DebridgeCrossChainProvider.apiEndpoint}/order/create-tx`,
            { params }
        );

        // if (!skipAmountChangeCheck) {
        //     EvmCrossChainTrade.checkAmountChange(
        //         tx,
        //         estimation.dstChainTokenOut.amount,
        //         this.to.stringWeiAmount
        //     );
        // }

        return { tx, fixFee };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: 0,
            routePath: this.routePath
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );

        return fromUsd
            .plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee)
            .dividedBy(this.maxTheoreticalAmount);
    }

    public getUsdPrice(providerFeeToken?: BigNumber): BigNumber {
        let feeSum = new BigNumber(0);
        const providerFee = this.feeInfo.provider?.cryptoFee;

        if (providerFee) {
            feeSum = feeSum.plus(
                providerFee.amount.multipliedBy(providerFeeToken || providerFee.token.price)
            );
        }

        return this.to.price.multipliedBy(this.maxTheoreticalAmount).minus(feeSum);
    }
}
