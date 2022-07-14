import { combineOptions } from '@rsdk-common/utils/options';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { Token } from '@rsdk-core/blockchain/tokens/token';
import { Injector } from '@rsdk-core/sdk/injector';
import { oneinchApiParams } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/constants';
import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { OneinchQuoteRequest } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/models/oneinch-quote-request';
import { OneinchQuoteResponse } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/models/oneinch-quote-response';
import { OneinchSwapRequest } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/models/oneinch-swap-request';
import { OneinchSwapResponse } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/models/oneinch-swap-response';
import { getOneinchApiBaseUrl } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/utils';
import BigNumber from 'bignumber.js';

import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { OneinchTrade } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/oneinch-trade';
import { InstantTradeProvider } from '@rsdk-features/instant-trades/instant-trade-provider';
import { SwapCalculationOptions } from '@rsdk-features/instant-trades/models/swap-calculation-options';
import { createTokenNativeAddressProxy } from '@rsdk-features/instant-trades/dexes/common/utils/token-native-address-proxy';
import { Cache } from 'src/common';
import { BlockchainsInfo } from 'src/core';
import { TRADE_TYPE, TradeType } from 'src/features';

type OneinchSwapCalculationOptions = Omit<SwapCalculationOptions, 'deadlineMinutes'>;

export abstract class OneinchAbstractProvider extends InstantTradeProvider {
    private readonly httpClient = Injector.httpClient;

    private readonly defaultOptions: Required<OneinchSwapCalculationOptions> = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        slippageTolerance: 0.02,
        wrappedAddress: oneinchApiParams.nativeAddress,
        fromAddress: this.walletAddress
    };

    protected readonly gasMargin = 1;

    public get type(): TradeType {
        return TRADE_TYPE.ONE_INCH;
    }

    private get walletAddress(): string {
        return Injector.web3Private.address;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getOneinchApiBaseUrl(this.blockchain);
    }

    private async loadContractAddress(): Promise<string> {
        const response = await this.httpClient.get<{
            address: string;
        }>(`${this.apiBaseUrl}/approve/spender`);
        return response.address;
    }

    /**
     * Calculates input amount, based on amount, user wants to get.
     * @param from Token to sell.
     * @param to Token to get with output amount.
     * @param options Additional options.
     */
    public async calculateExactOutputAmount(
        from: PriceToken,
        to: PriceTokenAmount,
        options?: OneinchSwapCalculationOptions
    ): Promise<BigNumber> {
        return (await this.calculate(to, from, options)).to.tokenAmount;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options?: OneinchSwapCalculationOptions
    ): Promise<OneinchTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromTokenClone = createTokenNativeAddressProxy(from, oneinchApiParams.nativeAddress);
        const toTokenClone = createTokenNativeAddressProxy(toToken, oneinchApiParams.nativeAddress);

        const [contractAddress, { toTokenAmountInWei, estimatedGas, path, data }] =
            await Promise.all([
                this.loadContractAddress(),
                this.getTradeInfo(fromTokenClone, toTokenClone, fullOptions)
            ]);
        path[0] = from;
        path[path.length - 1] = toToken;

        const oneinchTradeStruct = {
            contractAddress,
            from,
            to: new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: toTokenAmountInWei
            }),
            slippageTolerance: fullOptions.slippageTolerance,
            disableMultihops: fullOptions.disableMultihops,
            path,
            data
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new OneinchTrade(oneinchTradeStruct);
        }

        const gasPriceInfo = await this.getGasPriceInfo();
        const gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo);
        return new OneinchTrade({
            ...oneinchTradeStruct,
            gasFeeInfo
        });
    }

    private async getTradeInfo(
        from: PriceTokenAmount,
        toToken: Token,
        options: Required<OneinchSwapCalculationOptions>
    ): Promise<{
        toTokenAmountInWei: BigNumber;
        estimatedGas: BigNumber;
        path: Token[];
        data: string | null;
    }> {
        const isDefaultWrappedAddress = options.wrappedAddress === oneinchApiParams.nativeAddress;
        const isNative = from.isNative || from.address === oneinchApiParams.nativeAddress;
        const fromTokenAddress =
            isNative && !isDefaultWrappedAddress ? options.wrappedAddress : from.address;
        const quoteTradeParams: OneinchQuoteRequest = {
            params: {
                fromTokenAddress,
                toTokenAddress: toToken.address,
                amount: from.stringWeiAmount,
                mainRouteParts: options.disableMultihops ? '1' : undefined
            }
        };

        let oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse;
        let estimatedGas: BigNumber;
        let toTokenAmount: string;
        let data: string | null = null;
        try {
            if (!this.walletAddress) {
                throw new Error('Address is not set');
            }

            if (options.gasCalculation !== 'disabled') {
                await OneinchTrade.checkIfNeedApproveAndThrowError(from);
            }

            const swapTradeParams: OneinchSwapRequest = {
                params: {
                    ...quoteTradeParams.params,
                    slippage: (options.slippageTolerance * 100).toString(),
                    fromAddress: options.fromAddress,
                    disableEstimate: options.gasCalculation === 'disabled'
                }
            };
            oneInchTrade = await this.httpClient.get<OneinchSwapResponse>(
                `${this.apiBaseUrl}/swap`,
                swapTradeParams
            );

            estimatedGas = new BigNumber(oneInchTrade.tx.gas);
            toTokenAmount = oneInchTrade.toTokenAmount;
            data = oneInchTrade.tx.data;
        } catch (_err) {
            oneInchTrade = await this.httpClient.get<OneinchQuoteResponse>(
                `${this.apiBaseUrl}/quote`,
                quoteTradeParams
            );
            if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
                throw new RubicSdkError('1inch quote error');
            }

            estimatedGas = new BigNumber(oneInchTrade.estimatedGas);
            toTokenAmount = oneInchTrade.toTokenAmount;
        }

        const path = await this.extractPath(from, toToken, oneInchTrade);

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
                return BlockchainsInfo.getBlockchainByName(this.blockchain).nativeCoin;
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
}
