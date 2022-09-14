import { InsufficientFundsOneinchError, LowSlippageError, RubicSdkError } from 'src/common/errors';
import {
    createTokenNativeAddressProxy,
    createTokenNativeAddressProxyInPathStartAndEnd
} from 'src/features/instant-trades/dexes/common/utils/token-native-address-proxy';
import { OneinchSwapResponse } from 'src/features/instant-trades/dexes/common/oneinch-common/models/oneinch-swap-response';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    OptionsGasParams,
    TransactionGasParams
} from 'src/features/instant-trades/models/gas-params';
import { InstantTrade } from 'src/features/instant-trades/instant-trade';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/instant-trades/models/encode-transaction-options';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { GasFeeInfo } from 'src/features/instant-trades/models/gas-fee-info';
import { TransactionReceipt } from 'web3-eth';
import { TransactionConfig } from 'web3-core';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import { getOneinchApiBaseUrl } from 'src/features/instant-trades/dexes/common/oneinch-common/utils';
import { oneinchApiParams } from 'src/features/instant-trades/dexes/common/oneinch-common/constants';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { SwapRequestError } from 'src/common/errors/swap/swap-request.error';
import { Cache } from 'src/common/utils/decorators';
import { OneinchSwapRequest } from 'src/features/instant-trades/dexes/common/oneinch-common/models/oneinch-swap-request';
import BigNumber from 'bignumber.js';

type OneinchTradeStruct = {
    contractAddress: string;
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    slippageTolerance: number;
    disableMultihops: boolean;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo | null;
    data: string | null;
};

export class OneinchTrade extends InstantTrade {
    /** @internal */
    public static async checkIfNeedApproveAndThrowError(
        from: PriceTokenAmount
    ): Promise<void | never> {
        const needApprove = await new OneinchTrade({
            from
        } as OneinchTradeStruct).needApprove();
        if (needApprove) {
            throw new RubicSdkError('Approve is needed');
        }
    }

    private readonly httpClient = Injector.httpClient;

    /** @internal */
    public readonly contractAddress: string;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    private readonly nativeSupportedFrom: PriceTokenAmount;

    private readonly nativeSupportedTo: PriceTokenAmount;

    public gasFeeInfo: GasFeeInfo | null;

    public slippageTolerance: number;

    private readonly disableMultihops: boolean;

    /**
     * Path, through which tokens will be converted.
     */
    public readonly path: ReadonlyArray<Token>;

    /**
     * @internal
     * Path with wrapped native address.
     */
    public readonly wrappedPath: ReadonlyArray<Token>;

    /** @internal */
    public readonly transactionData: string | null;

    public get type(): TradeType {
        return TRADE_TYPE.ONE_INCH;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getOneinchApiBaseUrl(this.from.blockchain);
    }

    constructor(oneinchTradeStruct: OneinchTradeStruct) {
        super(oneinchTradeStruct.from.blockchain);

        this.contractAddress = oneinchTradeStruct.contractAddress;
        this.from = oneinchTradeStruct.from;
        this.to = oneinchTradeStruct.to;
        this.nativeSupportedFrom = createTokenNativeAddressProxy(
            oneinchTradeStruct.from,
            oneinchApiParams.nativeAddress
        );
        this.nativeSupportedTo = createTokenNativeAddressProxy(
            oneinchTradeStruct.to,
            oneinchApiParams.nativeAddress
        );
        this.gasFeeInfo = oneinchTradeStruct.gasFeeInfo || null;
        this.slippageTolerance = oneinchTradeStruct.slippageTolerance;
        this.disableMultihops = oneinchTradeStruct.disableMultihops;
        this.path = oneinchTradeStruct.path;
        this.transactionData = oneinchTradeStruct.data;
        this.wrappedPath = createTokenNativeAddressProxyInPathStartAndEnd(
            this.path,
            oneinchApiParams.nativeAddress
        );
    }

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.nativeSupportedFrom.isNative) {
            return false;
        }

        const response = await this.httpClient.get<{
            allowance: string;
        }>(`${this.apiBaseUrl}/approve/allowance`, {
            params: {
                tokenAddress: this.nativeSupportedFrom.address,
                walletAddress: this.walletAddress
            }
        });
        const allowance = new BigNumber(response.allowance);
        return allowance.lt(this.nativeSupportedFrom.weiAmount);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        await this.checkAllowanceAndApprove(options);

        try {
            const apiTradeData = await this.getTradeData().catch(err => {
                throw new Error(err?.response?.data?.description || err.message);
            });

            const { gas, gasPrice } = this.getGasParamsFromApiTradeData(options, apiTradeData);

            const transactionOptions = {
                onTransactionHash: options.onConfirm,
                data: apiTradeData.tx.data,
                gas,
                gasPrice
            };

            return this.web3Private.trySendTransaction(
                apiTradeData.tx.to,
                this.nativeSupportedFrom.isNative ? this.nativeSupportedFrom.stringWeiAmount : '0',
                transactionOptions
            );
        } catch (err) {
            const inchSpecificError = this.specifyError(err);
            if (inchSpecificError) {
                throw inchSpecificError;
            }

            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }

            throw this.parseError(err);
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        try {
            const apiTradeData = await this.getTradeData(true, options.fromAddress);
            const { gas, gasPrice } = this.getGasParamsFromApiTradeData(options, apiTradeData);

            return {
                ...apiTradeData.tx,
                gas,
                gasPrice
            };
        } catch (err) {
            const inchSpecificError = this.specifyError(err);
            if (inchSpecificError) {
                throw inchSpecificError;
            }
            throw new RubicSdkError(err.message || err.toString());
        }
    }

    private getTradeData(
        disableEstimate = false,
        fromAddress?: string
    ): Promise<OneinchSwapResponse> {
        const swapRequest: OneinchSwapRequest = {
            params: {
                fromTokenAddress: this.nativeSupportedFrom.address,
                toTokenAddress: this.nativeSupportedTo.address,
                amount: this.nativeSupportedFrom.stringWeiAmount,
                slippage: (this.slippageTolerance * 100).toString(),
                fromAddress: fromAddress || this.walletAddress,
                disableEstimate,
                ...(this.disableMultihops && { mainRouteParts: '1' })
            }
        };

        return this.httpClient.get<OneinchSwapResponse>(`${this.apiBaseUrl}/swap`, swapRequest);
    }

    private getGasParamsFromApiTradeData(
        options: OptionsGasParams,
        apiTradeData: OneinchSwapResponse
    ): TransactionGasParams {
        return this.getGasParams({
            gasLimit: options.gasLimit || apiTradeData.tx.gas.toString(),
            gasPrice: options.gasPrice || apiTradeData.tx.gasPrice
        });
    }

    private specifyError(err: {
        error?:
            | {
                  message?: string;
                  description?: string;
              }
            | Error;
    }): RubicSdkError | null {
        const inchError = err?.error || err;

        if (inchError) {
            if ('message' in inchError) {
                if (inchError.message?.includes('cannot estimate')) {
                    const nativeToken =
                        nativeTokensList[this.nativeSupportedFrom.blockchain]?.symbol;
                    const message = `1inch sets increased costs on gas fee. For transaction enter less ${nativeToken} amount or top up your ${nativeToken} balance.`;
                    return new RubicSdkError(message);
                }
                if (inchError.message?.includes('insufficient funds for transfer')) {
                    return new InsufficientFundsOneinchError(this.from.blockchain);
                }
            }
            if ('description' in inchError && inchError.description?.includes('cannot estimate')) {
                return new LowSlippageError();
            }
        }

        return null;
    }
}
