import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, TooLowAmountError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { SolanaCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/solana-cross-chain-trade/solana-cross-chain-trade';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';
import { DebridgeSolanaCrossChainTradeConstructor } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/debridge-cross-chain-trade-constructor';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { DlnSolanaTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { deBridgeReferralCode } from '../constants/debridge-code';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class DebridgeSolanaCrossChainTrade extends SolanaCrossChainTrade {
    /** @internal */
    public readonly transitAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly transactionRequest: TransactionRequest;

    private readonly slippage: number;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public readonly isAggregator = false;

    public readonly onChainSubtype = {
        from: ON_CHAIN_TRADE_TYPE.DLN,
        to: ON_CHAIN_TRADE_TYPE.DLN
    };

    public readonly bridgeType = BRIDGE_TYPE.DEBRIDGE;

    public readonly from: PriceTokenAmount<SolanaBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    private latestFixedFee: string | null = null;

    private get fromBlockchain(): DeBridgeCrossChainSupportedBlockchain & SolanaBlockchainName {
        return this.from.blockchain as DeBridgeCrossChainSupportedBlockchain & SolanaBlockchainName;
    }

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            throw new Error('Solana contract is not implemented yet');
        }
        return rubicProxyContractAddress[this.fromBlockchain].gateway;
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
        super(providerAddress, routePath, false);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.transactionRequest = crossChainTrade.transactionRequest;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.transitAmount = crossChainTrade.transitAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        let transactionHash: string;

        try {
            const { data } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options?.receiverAddress
            );

            const { onConfirm } = options;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

            await this.web3Private.sendTransaction({
                data,
                onTransactionHash,
                fromAddress: this.walletAddress
            });

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
        throw new Error('Solana contracts is not implemented yet');
    }

    protected async getTransactionConfigAndAmount(receiverAddress?: string): Promise<{
        config: { data: string };
        amount: string;
    }> {
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
            referralCode: deBridgeReferralCode
        };

        const {
            tx: config,
            fixFee,
            estimation
        } = await DlnApiService.fetchCrossChainSwapData<DlnSolanaTransactionResponse>(params);
        this.latestFixedFee = Boolean(fixFee) ? fixFee : '0';

        return { config, amount: estimation.dstChainTokenOut.maxTheoreticalAmount };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage,
            routePath: this.routePath
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );

        return fromUsd.plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee).dividedBy(this.to.tokenAmount);
    }
}
