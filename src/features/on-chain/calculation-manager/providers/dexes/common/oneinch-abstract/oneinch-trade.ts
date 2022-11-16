import {
    InsufficientFundsOneinchError,
    LowSlippageError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import {
    createTokenNativeAddressProxy,
    createTokenNativeAddressProxyInPathStartAndEnd
} from 'src/features/common/utils/token-native-address-proxy';
import { OneinchSwapResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-swap-response';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { getOneinchApiBaseUrl } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/utils';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';
import { Cache } from 'src/common/utils/decorators';
import { OneinchSwapRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-swap-request';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { parseError } from 'src/common/utils/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { Injector } from 'src/core/injector/injector';
import BigNumber from 'bignumber.js';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';

type OneinchTradeStruct = {
    dexContractAddress: string;
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    slippageTolerance: number;
    disableMultihops: boolean;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo | null;
    data: string | null;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
};

export class OneinchTrade extends EvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(
        oneinchTradeStruct: OneinchTradeStruct,
        useProxy: boolean
    ): Promise<BigNumber | null> {
        const fromBlockchain = oneinchTradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new OneinchTrade(
                oneinchTradeStruct,
                useProxy,
                EvmWeb3Pure.EMPTY_ADDRESS
            ).encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (!gasLimit?.isFinite()) {
                return null;
            }
            return gasLimit;
        } catch (_err) {
            return null;
        }
    }

    /** @internal */
    public static async checkIfNeedApproveAndThrowError(
        from: PriceTokenAmount
    ): Promise<void | never> {
        const needApprove = await new OneinchTrade(
            {
                from
            } as OneinchTradeStruct,
            false,
            EvmWeb3Pure.EMPTY_ADDRESS
        ).needApprove();
        if (needApprove) {
            throw new RubicSdkError('Approve is needed');
        }
    }

    public readonly dexContractAddress: string;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    private readonly nativeSupportedFromWithoutFee: PriceTokenAmount;

    private readonly nativeSupportedTo: PriceTokenAmount;

    public gasFeeInfo: GasFeeInfo | null;

    public slippageTolerance: number;

    private readonly disableMultihops: boolean;

    /**
     * Path, through which tokens will be converted.
     */
    public readonly path: ReadonlyArray<Token>;

    public readonly proxyFeeInfo: OnChainProxyFeeInfo | undefined;

    protected readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

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

    constructor(
        oneinchTradeStruct: OneinchTradeStruct,
        useProxy: boolean,
        providerAddress: string
    ) {
        super(useProxy, providerAddress);

        this.dexContractAddress = oneinchTradeStruct.dexContractAddress;
        this.from = oneinchTradeStruct.from;
        this.to = oneinchTradeStruct.to;
        this.gasFeeInfo = oneinchTradeStruct.gasFeeInfo || null;
        this.slippageTolerance = oneinchTradeStruct.slippageTolerance;
        this.disableMultihops = oneinchTradeStruct.disableMultihops;
        this.path = oneinchTradeStruct.path;
        this.transactionData = oneinchTradeStruct.data;
        this.wrappedPath = createTokenNativeAddressProxyInPathStartAndEnd(
            this.path,
            oneinchApiParams.nativeAddress
        );
        this.proxyFeeInfo = oneinchTradeStruct.proxyFeeInfo;
        this.fromWithoutFee = oneinchTradeStruct.fromWithoutFee;

        this.nativeSupportedFromWithoutFee = createTokenNativeAddressProxy(
            oneinchTradeStruct.fromWithoutFee,
            oneinchApiParams.nativeAddress
        );
        this.nativeSupportedTo = createTokenNativeAddressProxy(
            oneinchTradeStruct.to,
            oneinchApiParams.nativeAddress
        );
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        this.checkFromAddress(options.fromAddress, true);
        this.checkReceiverAddress(options.receiverAddress);

        try {
            const apiTradeData = await this.getTradeData(
                true,
                options.fromAddress,
                options.receiverAddress
            );
            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: apiTradeData.tx.gas.toString(),
                gasPrice: apiTradeData.tx.gasPrice
            });

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
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw parseError(err, err?.response?.data?.description || err.message);
        }
    }

    private getTradeData(
        disableEstimate = false,
        fromAddress?: string,
        receiverAddress?: string
    ): Promise<OneinchSwapResponse> {
        const swapRequest: OneinchSwapRequest = {
            params: {
                fromTokenAddress: this.nativeSupportedFromWithoutFee.address,
                toTokenAddress: this.nativeSupportedTo.address,
                amount: this.nativeSupportedFromWithoutFee.stringWeiAmount,
                slippage: (this.slippageTolerance * 100).toString(),
                fromAddress: fromAddress || this.walletAddress,
                disableEstimate,
                ...(this.disableMultihops && { mainRouteParts: '1' }),
                ...(receiverAddress && { destReceiver: receiverAddress })
            }
        };

        return this.httpClient.get<OneinchSwapResponse>(`${this.apiBaseUrl}/swap`, swapRequest);
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
                    const nativeToken = nativeTokensList[this.from.blockchain]?.symbol;
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
