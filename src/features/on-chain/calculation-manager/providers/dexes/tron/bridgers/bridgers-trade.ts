import BigNumber from 'bignumber.js';
import { SwapRequestError } from 'src/common/errors';
import { PriceTokenAmount, Token, TokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import {
    BridgersQuoteRequest,
    BridgersQuoteResponse
} from 'src/features/common/providers/bridgers/models/bridgers-quote-api';
import {
    BridgersSwapRequest,
    BridgersSwapResponse
} from 'src/features/common/providers/bridgers/models/bridgers-swap-api';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { TronBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/tron-bridgers-transaction-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainPlatformFee } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { TronOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/tron-on-chain-trade/tron-on-chain-trade';

export class BridgersTrade extends TronOnChainTrade {
    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly to: PriceTokenAmount<TronBlockchainName>;

    public readonly path: ReadonlyArray<Token> = [];

    public readonly slippageTolerance: number;

    private readonly contractAddress: string;

    public readonly cryptoFeeToken: TokenAmount;

    public readonly platformFee: OnChainPlatformFee;

    public readonly quoteReqBody: BridgersQuoteRequest;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BRIDGERS;
    }

    protected get spenderAddress(): string {
        return this.contractAddress;
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this.to;
    }

    public readonly feeInfo: FeeInfo;

    constructor(
        tradeStruct: {
            from: PriceTokenAmount<TronBlockchainName>;
            to: PriceTokenAmount<TronBlockchainName>;
            slippageTolerance: number;
            contractAddress: string;
            cryptoFeeToken: TokenAmount;
            platformFee: OnChainPlatformFee;
            quoteReqBody: BridgersQuoteRequest;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.contractAddress = tradeStruct.contractAddress;
        this.cryptoFeeToken = tradeStruct.cryptoFeeToken;
        this.platformFee = tradeStruct.platformFee;
        this.quoteReqBody = tradeStruct.quoteReqBody;
        this.feeInfo = {
            rubicProxy: {
                platformFee: {
                    percent: tradeStruct.platformFee.percent,
                    token: tradeStruct.platformFee.token
                }
            }
        };
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState(options?.testMode);
        await this.checkAllowanceAndApprove(options);

        if (!options.skipAmountCheck) {
            await this.checkRateUpdated();
        }

        try {
            const transactionData = await this.getTransactionData(options);

            return this.web3Private.sendTransaction(
                this.contractAddress,
                transactionData.functionName,
                transactionData.parameter,
                { ...transactionData.options, onTransactionHash: options.onConfirm }
            );
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw err;
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TronTransactionConfig> {
        try {
            const transactionData = await this.getTransactionData(options);

            return {
                to: this.contractAddress,
                signature: transactionData.functionName,
                arguments: transactionData.parameter,
                feeLimit: options.feeLimit || transactionData.options.feeLimit,
                callValue: transactionData.options.callValue
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw err;
        }
    }

    private async getTransactionData(options: {
        fromAddress?: string;
        receiverAddress?: string;
    }): Promise<TronBridgersTransactionData> {
        const fromTokenAddress = createTokenNativeAddressProxy(
            this.from,
            bridgersNativeAddress,
            false
        ).address;
        const toTokenAddress = createTokenNativeAddressProxy(
            this.to,
            bridgersNativeAddress,
            false
        ).address;
        const fromAddress = options.fromAddress || this.walletAddress;
        const toAddress = options.receiverAddress || fromAddress;

        const amountOutMin = this.toTokenAmountMin.stringWeiAmount;

        const swapRequest: BridgersSwapRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromAddress,
            toAddress,
            fromTokenChain: toBridgersBlockchain[this.from.blockchain],
            toTokenChain: toBridgersBlockchain[this.to.blockchain],
            fromTokenAmount: this.from.stringWeiAmount,
            amountOutMin,
            equipmentNo: fromAddress.slice(0, 32),
            sourceFlag: 'rubic_widget'
        };

        const swapData = await Injector.httpClient.post<
            BridgersSwapResponse<TronBridgersTransactionData>
        >('https://sswap.swft.pro/api/sswap/swap', swapRequest);

        return swapData.data.txData;
    }

    private async checkRateUpdated(): Promise<void> {
        const quoteResponse = await this.httpClient.post<BridgersQuoteResponse>(
            'https://sswap.swft.pro/api/sswap/quote',
            this.quoteReqBody
        );
        const transactionData = quoteResponse.data?.txData;
        const newToToken = new PriceTokenAmount({
            ...this.to.asStruct,
            tokenAmount: new BigNumber(transactionData.toTokenAmount)
        });

        this.checkAmountChange(newToToken.stringWeiAmount, this.to.stringWeiAmount);
    }
}
