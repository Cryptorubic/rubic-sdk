import { combineOptions } from '@common/utils/options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { Injector } from '@core/sdk/injector';
import { oneinchApiParams } from '@features/instant-trades/dexes/common/oneinch-common/constants';
import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { OneinchQuoteRequest } from '@features/instant-trades/dexes/common/oneinch-common/models/oneinch-quote-request';
import { OneinchQuoteResponse } from '@features/instant-trades/dexes/common/oneinch-common/models/oneinch-quote-response';
import { OneinchSwapRequest } from '@features/instant-trades/dexes/common/oneinch-common/models/oneinch-swap-request';
import { OneinchSwapResponse } from '@features/instant-trades/dexes/common/oneinch-common/models/oneinch-swap-response';
import { OneinchTokensResponse } from '@features/instant-trades/dexes/common/oneinch-common/models/oneinch-tokens-response';
import { getOneinchApiBaseUrl } from '@features/instant-trades/dexes/common/oneinch-common/utils';
import BigNumber from 'bignumber.js';

import { PriceToken } from '@core/blockchain/tokens/price-token';
import { OneinchTrade } from '@features/instant-trades/dexes/common/oneinch-common/oneinch-trade';
import { InstantTradeProvider } from '@features/instant-trades/instant-trade-provider';
import { SwapCalculationOptions } from '@features/instant-trades/models/swap-calculation-options';
import { createTokenNativeAddressProxy } from '@features/instant-trades/dexes/common/utils/token-native-address-proxy';
import { Cache } from 'src/common';
import { BlockchainsInfo } from 'src/core';

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

    private supportedTokens: string[] = [];

    private get walletAddress(): string {
        return Injector.web3Private.address;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getOneinchApiBaseUrl(this.blockchain);
    }

    private async getSupportedTokensByBlockchain(): Promise<string[]> {
        if (this.supportedTokens.length) {
            return this.supportedTokens;
        }

        const oneinchTokensResponse: OneinchTokensResponse = await this.httpClient.get(
            `${this.apiBaseUrl}/tokens`
        );
        this.supportedTokens = Object.keys(oneinchTokensResponse.tokens).map(tokenAddress =>
            tokenAddress.toLowerCase()
        );

        return this.supportedTokens;
    }

    private async loadContractAddress(): Promise<string> {
        const response = await this.httpClient.get<{
            address: string;
        }>(`${this.apiBaseUrl}/approve/spender`);
        return response.address;
    }

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

        const fromClone = createTokenNativeAddressProxy(from, oneinchApiParams.nativeAddress);
        const toTokenClone = createTokenNativeAddressProxy(toToken, oneinchApiParams.nativeAddress);

        const supportedTokensAddresses = await this.getSupportedTokensByBlockchain();
        if (
            !supportedTokensAddresses.includes(fromClone.address.toLowerCase()) ||
            !supportedTokensAddresses.includes(toTokenClone.address.toLowerCase())
        ) {
            throw new RubicSdkError("Oneinch doesn't support this tokens");
        }

        const [contractAddress, { toTokenAmountInWei, estimatedGas, path, data }] =
            await Promise.all([
                this.loadContractAddress(),
                this.getTradeInfo(fromClone, toTokenClone, fullOptions)
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
        const quoteTradeParams: OneinchQuoteRequest = {
            params: {
                fromTokenAddress: from.address,
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
     * @return Promise<Token[]> Tokens array, used in the route.
     */
    private async extractPath(
        fromToken: Token,
        toToken: Token,
        oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse
    ): Promise<Token[]> {
        const addressesPath = oneInchTrade.protocols[0].map(protocol => protocol[0].toTokenAddress);
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
            tokensPathWithoutNativeIndex++;

            return token;
        });

        return [fromToken, ...tokensPath, toToken];
    }
}
