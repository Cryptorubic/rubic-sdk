import BigNumber from 'bignumber.js';
import {
    InsufficientFundsOneinchError,
    LowSlippageDeflationaryTokenError,
    LowSlippageError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Cache } from 'src/common/utils/decorators';
import { parseError } from 'src/common/utils/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    createTokenNativeAddressProxy,
    createTokenNativeAddressProxyInPathStartAndEnd
} from 'src/features/common/utils/token-native-address-proxy';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/constants/constants';
import { OneinchSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-swap-request';
import { OneinchSwapResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-swap-response';
import { OneinchTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-trade-struct';
import { OneInchApiService } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/one-inch-api-service';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class OneInchTrade extends EvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(tradeStruct: OneinchTradeStruct): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new OneInchTrade(
                tradeStruct,
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
        from: PriceTokenAmount,
        toToken: Token,
        fromWithoutFee: PriceTokenAmount,
        fromAddress: string,
        useProxy: boolean
    ): Promise<void | never> {
        const needApprove = await new OneInchTrade(
            {
                from,
                to: toToken,
                fromWithoutFee,
                useProxy,
                path: [from, toToken] as ReadonlyArray<Token>
            } as OneinchTradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS
        ).needApprove(fromAddress);
        if (needApprove) {
            throw new RubicSdkError('Approve is needed');
        }
    }

    public readonly dexContractAddress: string;

    private readonly nativeSupportedFromWithoutFee: PriceTokenAmount;

    private readonly nativeSupportedTo: PriceTokenAmount;

    private readonly disableMultihops: boolean;

    private readonly availableProtocols: string | undefined;

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

    constructor(tradeStruct: OneinchTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this.dexContractAddress = tradeStruct.dexContractAddress;
        this.disableMultihops = tradeStruct.disableMultihops;
        this.transactionData = tradeStruct.data;
        this.availableProtocols = tradeStruct.availableProtocols;
        this.wrappedPath = createTokenNativeAddressProxyInPathStartAndEnd(
            this.path,
            oneinchApiParams.nativeAddress
        );

        this.nativeSupportedFromWithoutFee = createTokenNativeAddressProxy(
            tradeStruct.fromWithoutFee,
            oneinchApiParams.nativeAddress
        );
        this.nativeSupportedTo = createTokenNativeAddressProxy(
            tradeStruct.to,
            oneinchApiParams.nativeAddress
        );
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            const txData = await this.getTradeData(
                true,
                options.fromAddress,
                options.receiverAddress
            );
            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: txData.gas,
                gasPrice: txData.gasPrice
            });

            return {
                ...txData,
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
            if (this.isDeflationError()) {
                throw new LowSlippageDeflationaryTokenError();
            }
            throw parseError(err, err?.response?.data?.description || err.message);
        }
    }

    private async getTradeData(
        disableEstimate = false,
        fromAddress?: string,
        receiverAddress?: string
    ): Promise<EvmEncodeConfig> {
        const fromTokenAddress = this.nativeSupportedFromWithoutFee.address;
        const toTokenAddress = this.nativeSupportedTo.address;
        const swapRequest: OneinchSwapRequest = {
            params: {
                src: fromTokenAddress,
                dst: toTokenAddress,
                amount: this.nativeSupportedFromWithoutFee.stringWeiAmount,
                slippage: (this.slippageTolerance * 100).toString(),
                from: fromAddress || this.walletAddress,
                disableEstimate,
                ...(this.disableMultihops && {
                    connectorTokens: `${fromTokenAddress},${toTokenAddress}`
                }),
                ...(receiverAddress && { receiver: receiverAddress }),
                ...(this.availableProtocols && { protocols: this.availableProtocols })
            }
        };

        const { tx } = await this.getResponseFromApiToTransactionRequest(swapRequest);

        return {
            data: tx.data,
            value: tx.value,
            to: tx.to,
            gasPrice: tx.gasPrice,
            gas: String(tx.gas)
        };
    }

    @Cache({
        maxAge: 15_000
    })
    private async getResponseFromApiToTransactionRequest(
        params: OneinchSwapRequest
    ): Promise<OneinchSwapResponse> {
        return OneInchApiService.oneInchHttpGetRequest<OneinchSwapResponse>(
            'swap',
            this.from.blockchain,
            params
        );
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
