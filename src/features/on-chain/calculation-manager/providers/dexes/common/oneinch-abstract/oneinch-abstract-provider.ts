import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';
import { OneinchCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-calculation-options';
import { OneinchQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-quote-request';
import { OneinchQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-quote-response';
import { OneinchSwapRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-swap-request';
import { OneinchSwapResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-swap-response';
import { OneinchTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-trade-struct';
import { OneinchTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/oneinch-trade';
import {
    oneInchHttpGetApproveRequest,
    oneInchHttpGetRequest
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/utils';

export abstract class OneinchAbstractProvider extends EvmOnChainProvider {
    private readonly defaultOptions: Omit<OneinchCalculationOptions, 'fromAddress'> = {
        ...evmProviderDefaultOptions,
        disableMultihops: false,
        wrappedAddress: oneinchApiParams.nativeAddress
    };

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ONE_INCH;
    }

    private async loadContractAddress(): Promise<string> {
        const response = await oneInchHttpGetApproveRequest<{
            address: string;
        }>('approve/spender', this.blockchain);
        return response.address;
    }

    /**
     * Calculates input amount, based on amount, user wants to get.
     * @param from Token to sell.
     * @param to Token to get with output amount.
     * @param options Additional options.
     */
    public async calculateExactOutputAmount(
        from: PriceToken<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<BigNumber> {
        return (await this.calculate(to, from, options)).to.tokenAmount;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<OneinchTrade> {
        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.walletAddress;
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress
        });

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const fromTokenClone = createTokenNativeAddressProxy(
            fromWithoutFee,
            oneinchApiParams.nativeAddress
        );
        const toTokenClone = createTokenNativeAddressProxy(toToken, oneinchApiParams.nativeAddress);

        const [dexContractAddress, { toTokenAmountInWei, estimatedGas, path, data }] =
            await Promise.all([
                this.loadContractAddress(),
                this.getTradeInfo(fromTokenClone, toTokenClone, fromWithoutFee, fullOptions)
            ]);
        path[0] = from;
        path[path.length - 1] = toToken;

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: toTokenAmountInWei
        });
        const availableProtocols = this.getAvailableProtocols();

        const oneinchTradeStruct: OneinchTradeStruct = {
            dexContractAddress,
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            disableMultihops: fullOptions.disableMultihops,
            path,
            gasFeeInfo: null,
            data,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            availableProtocols
        };

        try {
            const gasPriceInfo = await this.getGasPriceInfo();
            const gasLimit = (await OneinchTrade.getGasLimit(oneinchTradeStruct)) || estimatedGas;
            const gasFeeInfo = getGasFeeInfo(gasLimit, gasPriceInfo);
            return new OneinchTrade(
                {
                    ...oneinchTradeStruct,
                    gasFeeInfo
                },
                fullOptions.providerAddress
            );
        } catch {
            return new OneinchTrade(oneinchTradeStruct, fullOptions.providerAddress);
        }
    }

    private async getTradeInfo(
        from: PriceTokenAmount,
        toToken: Token,
        fromWithoutFee: PriceTokenAmount,
        options: OneinchCalculationOptions
    ): Promise<{
        toTokenAmountInWei: BigNumber;
        estimatedGas: BigNumber;
        path: Token[];
        data: string | null;
    }> {
        const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
        const isDefaultWrappedAddress = options.wrappedAddress === oneinchApiParams.nativeAddress;
        const isNative = from.isNative || from.address === oneinchApiParams.nativeAddress;
        const fromTokenAddress =
            isNative && !isDefaultWrappedAddress ? options.wrappedAddress : from.address;
        const toTokenAddress = toToken.address;
        const availableProtocols = this.getAvailableProtocols();
        const quoteTradeParams: OneinchQuoteRequest = {
            params: {
                src: fromTokenAddress,
                dst: toTokenAddress,
                amount: from.stringWeiAmount,
                ...(options.disableMultihops && {
                    connectorTokens: `${fromTokenAddress},${toTokenAddress}`
                }),
                ...(availableProtocols && { protocols: availableProtocols })
            }
        };

        let oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse;
        let estimatedGas: BigNumber;
        let toTokenAmount: string;
        let data: string | null = null;
        let path = [] as Token[];

        try {
            if (!options.fromAddress) {
                throw new Error('Address is not set');
            }

            if (options.gasCalculation !== 'disabled') {
                await OneinchTrade.checkIfNeedApproveAndThrowError(
                    from,
                    toToken,
                    fromWithoutFee,
                    options.fromAddress,
                    options.useProxy
                );
            }

            const swapTradeParams: OneinchSwapRequest = {
                params: {
                    ...quoteTradeParams.params,
                    slippage: (options.slippageTolerance * 100).toString(),
                    from: this.walletAddress || fakeAddress,
                    disableEstimate: options.gasCalculation === 'disabled'
                }
            };
            oneInchTrade = await oneInchHttpGetRequest<OneinchSwapResponse>(
                'swap',
                this.blockchain,
                swapTradeParams
            );

            estimatedGas = new BigNumber(oneInchTrade.tx.gas);
            toTokenAmount = oneInchTrade.dstAmount;
            data = oneInchTrade.tx.data;
        } catch (_err) {
            oneInchTrade = await oneInchHttpGetRequest<OneinchQuoteResponse>(
                'quote',
                this.blockchain,
                quoteTradeParams
            );
            if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.dstAmount) {
                throw new RubicSdkError('1inch quote error');
            }

            estimatedGas = new BigNumber(oneInchTrade.gas);
            toTokenAmount = oneInchTrade.dstAmount;
        }

        if (oneInchTrade?.protocols?.length) {
            path = await this.extractPath(from, toToken, oneInchTrade);
        }

        return { toTokenAmountInWei: new BigNumber(toTokenAmount), estimatedGas, path, data };
    }

    /**
     * Extracts tokens path from oneInch api response.
     * @returns Promise<Token[]> Tokens array, used in the route.
     */
    private async extractPath(
        fromToken: Token,
        toToken: Token,
        oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse
    ): Promise<Token[]> {
        const addressesPath = oneInchTrade.protocols[0].map(protocol => {
            if (!protocol?.[0]) {
                throw new RubicSdkError('Protocol array must not be empty');
            }
            return protocol[0].toTokenAddress;
        });
        addressesPath.pop();

        const tokensPathWithoutNative = await Token.createTokens(
            addressesPath.filter(tokenAddress => tokenAddress !== oneinchApiParams.nativeAddress),
            this.blockchain
        );
        let tokensPathWithoutNativeIndex = 0;
        const tokensPath = addressesPath.map(tokenAddress => {
            if (tokenAddress === oneinchApiParams.nativeAddress) {
                return nativeTokensList[this.blockchain];
            }

            const token = tokensPathWithoutNative[tokensPathWithoutNativeIndex];
            if (!token) {
                throw new RubicSdkError('Token has to be defined');
            }

            tokensPathWithoutNativeIndex++;

            return token;
        });

        return [fromToken, ...tokensPath, toToken];
    }

    protected getAvailableProtocols(): string | undefined {
        return undefined;
    }
}
