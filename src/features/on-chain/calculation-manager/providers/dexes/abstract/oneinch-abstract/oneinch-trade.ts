import {
    InsufficientFundsOneinchError,
    LowSlippageError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import {
    createTokenNativeAddressProxy,
    createTokenNativeAddressProxyInPathStartAndEnd
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/utils/token-native-address-proxy';
import { OneinchSwapResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/models/oneinch-swap-response';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    OptionsGasParams,
    TransactionGasParams
} from 'src/features/on-chain/calculation-manager/providers/abstract/on-chain-trade/evm-on-chain-trade/models/gas-params';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/abstract/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { TransactionConfig } from 'web3-core';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { getOneinchApiBaseUrl } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/utils';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/constants';
import { Cache } from 'src/common/utils/decorators';
import { OneinchSwapRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/models/oneinch-swap-request';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/abstract/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

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

export class OneinchTrade extends EvmOnChainTrade {
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

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ONE_INCH;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getOneinchApiBaseUrl(this.from.blockchain);
    }

    constructor(oneinchTradeStruct: OneinchTradeStruct) {
        super();

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

        const allowance = await this.web3Public.getAllowance(
            this.nativeSupportedFrom.address,
            this.walletAddress,
            this.commonContractAddress
        );

        return allowance.lt(this.nativeSupportedFrom.weiAmount);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState();
        this.checkReceiverAddress(options.receiverAddress);

        await this.checkAllowanceAndApprove(options);

        try {
            const apiTradeData = await this.getTradeData(
                false,
                undefined,
                options.receiverAddress
            ).catch(err => {
                throw new Error(err?.response?.data?.description || err.message);
            });

            const { gas, gasPrice } = this.getGasParamsFromApiTradeData(options, apiTradeData);
            const value = this.nativeSupportedFrom.isNative
                ? this.nativeSupportedFrom.stringWeiAmount
                : '0';

            const receipt = await this.createProxyTrade(options, apiTradeData.tx.data, value, gas, gasPrice);
            return receipt.transactionHash;
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
        this.checkFromAddress(options.fromAddress, true);
        this.checkReceiverAddress(options.receiverAddress);

        try {
            const apiTradeData = await this.getTradeData(
                true,
                options.fromAddress,
                options.receiverAddress
            );
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

    public getTradeData(
        disableEstimate = false,
        fromAddress?: string,
        receiverAddress?: string
    ): Promise<OneinchSwapResponse> {
        const swapRequest: OneinchSwapRequest = {
            params: {
                fromTokenAddress: this.nativeSupportedFrom.address,
                toTokenAddress: this.nativeSupportedTo.address,
                amount: this.nativeSupportedFrom.stringWeiAmount,
                slippage: (this.slippageTolerance * 100).toString(),
                fromAddress: fromAddress || this.walletAddress,
                disableEstimate,
                ...(this.disableMultihops && { mainRouteParts: '1' }),
                ...(receiverAddress && { destReceiver: receiverAddress })
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
