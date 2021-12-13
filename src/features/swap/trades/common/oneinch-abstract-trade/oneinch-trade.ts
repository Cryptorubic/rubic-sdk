import { InstantTrade } from '@features/swap/trades/instant-trade';
import { Injector } from '@core/sdk/injector';
import { Pure } from '@common/decorators/pure.decorator';
import { getOneinchApiBaseUrl } from '@features/swap/utils/oneinch';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { OneinchSwapRequest } from '@features/swap/models/one-inch/OneinchSwapRequest';
import { OneinchSwapResponse } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchSwapResponse';
import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import InsufficientFundsOneinchError from '@common/errors/swap/InsufficientFundsOneinchError';
import { TokenWithFeeError } from '@common/errors/swap/TokenWithFeeError';
import { blockchains } from '@core/blockchain/constants/blockchains';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';
import { Token } from '@core/blockchain/tokens/token';
import { TransactionConfig } from 'web3-core';

type OneinchTradeStruct = {
    contractAddress: string;
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    gasFeeInfo: GasFeeInfo | null;
    slippageTolerance: number;
    disableMultihops: boolean;
    path: ReadonlyArray<Token>;
};

export class OneinchTrade extends InstantTrade {
    public static async checkIfNeedApproveAndThrowError(
        from: PriceTokenAmount
    ): Promise<void | never> {
        const needApprove = await new OneinchTrade({
            from
        } as OneinchTradeStruct).needApprove();
        if (needApprove) {
            throw new Error('need approve');
        }
    }

    private readonly httpClient = Injector.httpClient;

    protected readonly contractAddress: string;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly gasFeeInfo: GasFeeInfo | null;

    public slippageTolerance: number;

    private readonly disableMultihops: boolean;

    public readonly path: ReadonlyArray<Token>;

    @Pure
    private get apiBaseUrl(): string {
        return getOneinchApiBaseUrl(this.from.blockchain);
    }

    constructor(oneinchTradeStruct: OneinchTradeStruct) {
        super(oneinchTradeStruct.from.blockchain);

        this.contractAddress = oneinchTradeStruct.contractAddress;
        this.from = oneinchTradeStruct.from;
        this.to = oneinchTradeStruct.to;
        this.gasFeeInfo = oneinchTradeStruct.gasFeeInfo;
        this.slippageTolerance = oneinchTradeStruct.slippageTolerance;
        this.disableMultihops = oneinchTradeStruct.disableMultihops;
        this.path = oneinchTradeStruct.path;
    }

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative) {
            return false;
        }

        const response = await this.httpClient.get<{
            allowance: string;
        }>(`${this.apiBaseUrl}/approve/allowance`, {
            params: {
                tokenAddress: this.from.address,
                walletAddress: this.walletAddress
            }
        });
        const allowance = new BigNumber(response.allowance);
        return allowance.lt(this.from.weiAmount);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        const swapTradeParams: OneinchSwapRequest = {
            params: {
                fromTokenAddress: this.from.address,
                toTokenAddress: this.to.address,
                amount: this.from.stringWeiAmount,
                slippage: this.slippageTolerance.toString(),
                fromAddress: this.walletAddress,
                mainRouteParts: this.disableMultihops ? '1' : undefined
            }
        };

        try {
            const oneInchTrade = await this.httpClient.get<OneinchSwapResponse>(
                `${this.apiBaseUrl}/swap`,
                swapTradeParams
            );

            const trxOptions = {
                onTransactionHash: options.onConfirm,
                data: oneInchTrade.tx.data,
                gas: oneInchTrade.tx.gas.toString(),
                inWei: this.from.isNative || undefined,
                ...(this.gasFeeInfo?.gasPrice && { gasPrice: this.gasFeeInfo.gasPrice })
            };

            return this.web3Private.trySendTransaction(
                oneInchTrade.tx.to,
                this.from.isNative ? this.from.stringWeiAmount : '0',
                trxOptions
            );
        } catch (err) {
            this.specifyError(err);
            throw new RubicSdkError(err.message || err.toString());
        }
    }

    public async encode(): Promise<TransactionConfig> {
        try {
            const swapTradeParams: OneinchSwapRequest = {
                params: {
                    fromTokenAddress: this.from.address,
                    toTokenAddress: this.to.address,
                    amount: this.from.stringWeiAmount,
                    slippage: this.slippageTolerance.toString(),
                    fromAddress: this.walletAddress,
                    mainRouteParts: this.disableMultihops ? '1' : undefined
                }
            };

            const oneInchTrade = await this.httpClient.get<OneinchSwapResponse>(
                `${this.apiBaseUrl}/swap`,
                swapTradeParams
            );
            return oneInchTrade.tx;
        } catch (err) {
            this.specifyError(err);
            throw new RubicSdkError(err.message || err.toString());
        }
    }

    private specifyError(err: {
        error?: {
            message?: string;
            description?: string;
        };
    }): void | never {
        if (err.error) {
            if (err.error.message?.includes('cannot estimate')) {
                const nativeToken = blockchains.find(el => el.name === this.from.blockchain)!
                    .nativeCoin.symbol;
                const message = `1inch sets increased costs on gas fee. For transaction enter less ${nativeToken} amount or top up your ${nativeToken} balance.`;
                throw new RubicSdkError(message);
            }
            if (err.error.message?.includes('insufficient funds for transfer')) {
                throw new InsufficientFundsOneinchError();
            }
            if (err.error.description?.includes('cannot estimate')) {
                throw new TokenWithFeeError();
            }
        }
    }
}
