import {
    EncodeTransactionOptions,
    GasFeeInfo,
    SwapTransactionOptions,
    TRADE_TYPE,
    TradeType
} from 'src/features';
import { InstantTrade } from 'src/features/instant-trades/instant-trade';
import { Token } from 'src/core';
import { TransactionReceipt } from 'web3-eth';
import { Injector } from 'src/core/sdk/injector';
import { Route } from '@lifi/sdk';
import { TransactionConfig } from 'web3-core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { SwapRequestError } from 'src/common/errors/swap/swap-request.error';
import { LifiPairIsUnavailable } from 'src/common/errors/swap/lifi-pair-is-unavailable';
import { RubicSdkError } from 'src/common';

interface LifiTransactionRequest {
    data: string;
    gasLimit?: string;
    gasPrice?: string;
}

export class LifiTrade extends InstantTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        route: Route
    ): Promise<{
        gasLimit: BigNumber;
        gasPrice: BigNumber;
    } | null> {
        try {
            const transactionData = await new LifiTrade({
                from,
                to,
                gasFeeInfo: null,
                slippageTolerance: NaN,
                contractAddress: '',
                type: TRADE_TYPE.ONE_INCH,
                path: [],
                route,
                toTokenWeiAmountMin: new BigNumber(NaN)
            }).getTransactionData();

            if (!transactionData.gasLimit || !transactionData.gasPrice) {
                return null;
            }

            return {
                gasLimit: new BigNumber(transactionData.gasLimit),
                gasPrice: new BigNumber(transactionData.gasPrice)
            };
        } catch (_err) {
            return null;
        }
    }

    private readonly httpClient = Injector.httpClient;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly gasFeeInfo: GasFeeInfo | null;

    public readonly slippageTolerance: number;

    protected readonly contractAddress: string;

    public readonly type: TradeType;

    public readonly path: ReadonlyArray<Token>;

    private readonly route: Route;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(tradeStruct: {
        from: PriceTokenAmount;
        to: PriceTokenAmount;
        gasFeeInfo: GasFeeInfo | null;
        slippageTolerance: number;
        contractAddress: string;
        type: TradeType;
        path: ReadonlyArray<Token>;
        route: Route;
        toTokenWeiAmountMin: BigNumber;
    }) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
        this.gasFeeInfo = tradeStruct.gasFeeInfo;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.contractAddress = tradeStruct.contractAddress;
        this.type = tradeStruct.type;
        this.path = tradeStruct.path;
        this.route = tradeStruct.route;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        await this.checkAllowanceAndApprove(options);

        try {
            const { data, gasLimit, gasPrice } = await this.getTransactionData();

            return await Injector.web3Private.trySendTransaction(
                this.contractAddress,
                this.from.isNative ? this.from.stringWeiAmount : '0',
                {
                    data,
                    gas: options.gasLimit || gasLimit,
                    gasPrice: options.gasPrice || gasPrice,
                    onTransactionHash: options.onConfirm
                }
            );
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }

            if (err instanceof RubicSdkError) {
                throw err;
            }

            throw new LifiPairIsUnavailable();
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        try {
            const { data, gasLimit, gasPrice } = await this.getTransactionData();

            return {
                to: this.contractAddress,
                data: data!,
                value: this.from.isNative ? this.from.stringWeiAmount : '0',
                gas: options.gasLimit || gasLimit,
                gasPrice: options.gasPrice || gasPrice
            };
        } catch (err) {
            throw this.parseError(err);
        }
    }

    private async getTransactionData(): Promise<LifiTransactionRequest> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: this.walletAddress,
                toAddress: this.walletAddress
            },
            execution: {
                status: 'NOT_STARTED',
                process: [
                    {
                        message: 'Preparing swap.',
                        startedAt: Date.now(),
                        status: 'STARTED',
                        type: 'SWAP'
                    }
                ]
            }
        };

        const swapResponse: {
            transactionRequest: LifiTransactionRequest;
        } = await this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
            ...step
        });

        const { transactionRequest } = swapResponse;
        const gasLimit =
            transactionRequest.gasLimit && parseInt(transactionRequest.gasLimit, 16).toString();
        const gasPrice =
            transactionRequest.gasPrice && parseInt(transactionRequest.gasPrice, 16).toString();

        return {
            data: transactionRequest.data,
            gasLimit,
            gasPrice
        };
    }
}
