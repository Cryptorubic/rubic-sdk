import { OneinchSwapRequest } from '@features/swap/dexes/common/oneinch-common/models/oneinch-swap-request';
import { OneinchSwapResponse } from '@features/swap/dexes/common/oneinch-common/models/oneinch-swap-response';
import { getOneinchApiBaseUrl } from '@features/swap/dexes/common/oneinch-common/utils';
import { InstantTrade } from '@features/swap/instant-trade';
import { Injector } from '@core/sdk/injector';
import { Pure } from '@common/decorators/pure.decorator';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import InsufficientFundsOneinchError from '@common/errors/swap/InsufficientFundsOneinchError';
import { blockchains } from '@core/blockchain/constants/blockchains';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';
import { Token } from '@core/blockchain/tokens/token';
import { TransactionConfig } from 'web3-core';
import { LowSlippageError } from '@common/errors/swap/low-slippage.error';
import { EncodeFromAddressTransactionOptions } from '@features/swap/models/encode-transaction-options';

type OneinchTradeStruct = {
    contractAddress: string;
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    slippageTolerance: number;
    disableMultihops: boolean;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo | null;
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

    public gasFeeInfo: GasFeeInfo | null;

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
        this.gasFeeInfo = oneinchTradeStruct.gasFeeInfo || null;
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

        try {
            const trade = await this.getSwapTrade();
            const transactionOptions = {
                onTransactionHash: options.onConfirm,
                data: trade.tx.data,
                gas: trade.tx.gas.toString(),
                inWei: this.from.isNative || undefined,
                ...(this.gasFeeInfo?.gasPrice && { gasPrice: this.gasFeeInfo.gasPrice })
            };

            return this.web3Private.trySendTransaction(
                trade.tx.to,
                this.from.isNative ? this.from.stringWeiAmount : '0',
                transactionOptions
            );
        } catch (err) {
            this.specifyError(err);
            throw new RubicSdkError(err.message || err.toString());
        }
    }

    public async encode(options: EncodeFromAddressTransactionOptions): Promise<TransactionConfig> {
        try {
            const transactionConfig = (await this.getSwapTrade()).tx;
            const gas = options.gasLimit || transactionConfig.gas;
            const gasPrice = options.gasPrice || transactionConfig.gasPrice;

            return {
                ...transactionConfig,
                gas,
                gasPrice
            };
        } catch (err) {
            this.specifyError(err);
            throw new RubicSdkError(err.message || err.toString());
        }
    }

    private getSwapTrade(fromAddress?: string): Promise<OneinchSwapResponse> {
        return this.httpClient.get<OneinchSwapResponse>(
            `${this.apiBaseUrl}/swap`,
            this.getSwapTradeParams(fromAddress)
        );
    }

    private getSwapTradeParams(fromAddress?: string): OneinchSwapRequest {
        return {
            params: {
                fromTokenAddress: this.from.address,
                toTokenAddress: this.to.address,
                amount: this.from.stringWeiAmount,
                slippage: (this.slippageTolerance * 100).toString(),
                fromAddress: fromAddress || this.walletAddress,
                mainRouteParts: this.disableMultihops ? '1' : undefined
            }
        };
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
                throw new LowSlippageError();
            }
        }
    }
}
