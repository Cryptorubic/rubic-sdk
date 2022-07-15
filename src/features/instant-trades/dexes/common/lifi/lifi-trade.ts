import {
    EncodeTransactionOptions,
    GasFeeInfo,
    SwapTransactionOptions,
    TradeType
} from 'src/features';
import { InstantTrade } from 'src/features/instant-trades/instant-trade';
import { PriceTokenAmount, Token } from 'src/core';
import { TransactionReceipt } from 'web3-eth';
import { Injector } from 'src/core/sdk/injector';
import { Route } from '@lifi/sdk';
import { TransactionConfig } from 'web3-core';

export class LifiTrade extends InstantTrade {
    private readonly httpClient = Injector.httpClient;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly gasFeeInfo: GasFeeInfo | null;

    public readonly slippageTolerance: number;

    protected readonly contractAddress: string;

    public readonly type: TradeType;

    public readonly path: ReadonlyArray<Token>;

    private readonly route: Route;

    constructor(tradeStruct: {
        from: PriceTokenAmount;
        to: PriceTokenAmount;
        gasFeeInfo: GasFeeInfo | null;
        slippageTolerance: number;
        contractAddress: string;
        type: TradeType;
        path: ReadonlyArray<Token>;
        route: Route;
    }) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasFeeInfo = tradeStruct.gasFeeInfo;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.contractAddress = tradeStruct.contractAddress;
        this.type = tradeStruct.type;
        this.path = tradeStruct.path;
        this.route = tradeStruct.route;
    }

    public async swap(options?: SwapTransactionOptions): Promise<TransactionReceipt> {
        await this.checkWalletState();

        await this.checkAllowanceAndApprove(options);

        try {
            const data = await this.getSwapData();

            return Injector.web3Private.trySendTransaction(
                this.contractAddress,
                this.from.isNative ? this.from.stringWeiAmount : '0',
                {
                    data
                }
            );
        } catch (err) {
            throw this.parseError(err);
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        try {
            const data = await this.getSwapData();
            const { gas, gasPrice } = this.getGasParams(options);

            return {
                data,
                gas,
                gasPrice
            };
        } catch (err) {
            throw this.parseError(err);
        }
    }

    private async getSwapData(): Promise<string> {
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
            transactionRequest: {
                data: string;
            };
        } = await this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
            ...step
        });

        return swapResponse.transactionRequest.data;
    }
}
