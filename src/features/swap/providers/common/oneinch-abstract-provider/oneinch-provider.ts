import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { Injector } from '@core/sdk/injector';
import { OneinchTokensResponse } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchTokensResponse';
import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { SwapOptions } from '@features/swap/models/swap-options';
import BigNumber from 'bignumber.js';
import { OneinchQuoteRequest } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchQuoteRequest';
import { OneinchQuoteResponse } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchQuoteResponse';
import { OneinchSwapResponse } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchSwapResponse';
import { OneinchSwapRequest } from '@features/swap/models/one-inch/OneinchSwapRequest';
import { getGasPriceInfo } from '@features/swap/providers/common/utils/gas-price';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { oneinchApiParams } from '@features/swap/constants/oneinch/oneinch-api-params';
import { OneinchTrade } from '@features/swap/trades/common/oneinch-abstract-trade/oneinch-trade';
import {
    isOneinchSupportedBlockchain,
    OneinchSupportedBlockchain
} from '@features/swap/constants/oneinch/supported-blockchains';
import { getOneinchApiBaseUrl } from '@features/swap/utils/oneinch';

export class OneinchProvider {
    private readonly httpClient = Injector.httpClient;

    private readonly getWeb3Public = Injector.web3PublicService.getWeb3Public;

    private readonly supportedTokens: Record<OneinchSupportedBlockchain, string[] | undefined>;

    private get walletAddress(): string {
        return Injector.web3Private.address;
    }

    constructor() {
        this.supportedTokens = {} as Record<OneinchSupportedBlockchain, string[] | undefined>;
    }

    private createTokenProxy<T extends Token>(token: T): T {
        const tokenAddress = token.isNative ? oneinchApiParams.nativeAddress : token.address;
        return new Proxy<T>(token, {
            get: (target, key) => {
                if (!(key in target)) {
                    return undefined;
                }
                if (key === 'address') {
                    return tokenAddress;
                }
                return target[key as keyof T];
            }
        });
    }

    private async getSupportedTokensByBlockchain(blockchain: BLOCKCHAIN_NAME): Promise<string[]> {
        if (!isOneinchSupportedBlockchain(blockchain)) {
            throw new RubicSdkError(`${blockchain} is not supported by oneinch`);
        }

        if (this.supportedTokens[blockchain]) {
            return this.supportedTokens[blockchain]!;
        }

        const oneinchTokensResponse: OneinchTokensResponse = await this.httpClient.get(
            `${getOneinchApiBaseUrl(blockchain)}/tokens`
        );
        const supportedTokensByBlockchain = Object.keys(oneinchTokensResponse.tokens).map(
            tokenAddress => tokenAddress.toLowerCase()
        );
        this.supportedTokens[blockchain] = supportedTokensByBlockchain;

        return supportedTokensByBlockchain;
    }

    private async loadContractAddress(blockchain: BLOCKCHAIN_NAME): Promise<string> {
        const response = await this.httpClient.get<{
            address: string;
        }>(`${getOneinchApiBaseUrl(blockchain)}/approve/spender`);
        return response.address;
    }

    public async calculateTrade(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: SwapOptions = {
            gasCalculation: 'calculate',
            disableMultihops: false,
            deadline: 1200000, // 20 min
            slippageTolerance: 0.05
        }
    ): Promise<OneinchTrade> {
        const fromClone = this.createTokenProxy(from);
        const toTokenClone = this.createTokenProxy(toToken);

        const supportedTokensAddresses = await this.getSupportedTokensByBlockchain(from.blockchain);
        if (
            !supportedTokensAddresses.includes(fromClone.address.toLowerCase()) ||
            !supportedTokensAddresses.includes(toTokenClone.address.toLowerCase())
        ) {
            throw new RubicSdkError("Oneinch doesn't support this tokens");
        }

        const [contractAddress, { toTokenAmount, estimatedGas, path }] = await Promise.all([
            this.loadContractAddress(from.blockchain),
            this.getTradeInfo(fromClone, toTokenClone, options)
        ]);
        path[0] = from;
        path[path.length - 1] = toToken;

        const oneinchTrade = {
            contractAddress,
            from: fromClone,
            to: new PriceTokenAmount({
                ...toTokenClone.asStruct,
                tokenAmount: toTokenAmount
            }),
            gasFeeInfo: null,
            slippageTolerance: options.slippageTolerance,
            disableMultihops: options.disableMultihops,
            path
        };
        if (options.gasCalculation === 'disabled') {
            return new OneinchTrade(oneinchTrade);
        }

        const gasPriceInfo = await getGasPriceInfo(from.blockchain);
        const gasFeeInEth = gasPriceInfo.gasPriceInEth.multipliedBy(estimatedGas);
        const gasFeeInUsd = gasPriceInfo.gasPriceInUsd.multipliedBy(estimatedGas);

        return new OneinchTrade({
            ...oneinchTrade,
            gasFeeInfo: {
                gasLimit: estimatedGas.toFixed(0),
                gasPrice: gasPriceInfo.gasPrice,
                gasFeeInUsd,
                gasFeeInEth
            }
        });
    }

    private async getTradeInfo(
        from: PriceTokenAmount,
        toToken: Token,
        options: SwapOptions
    ): Promise<{ toTokenAmount: BigNumber; estimatedGas: BigNumber; path: Token[] }> {
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
        try {
            if (!this.walletAddress) {
                throw new Error('User has not connected');
            }

            if (!from.isNative) {
                const response = await this.httpClient.get<{
                    allowance: string;
                }>(`${getOneinchApiBaseUrl(from.blockchain)}/approve/allowance`, {
                    params: {
                        tokenAddress: from.address,
                        walletAddress: this.walletAddress
                    }
                });
                if (new BigNumber(from.weiAmount).gt(response.allowance)) {
                    throw new Error('User have no allowance');
                }
            }

            const swapTradeParams: OneinchSwapRequest = {
                params: {
                    ...quoteTradeParams.params,
                    slippage: options.slippageTolerance.toString(),
                    fromAddress: this.walletAddress
                }
            };
            oneInchTrade = await this.httpClient.get<OneinchSwapResponse>(
                `${getOneinchApiBaseUrl(from.blockchain)}/swap`,
                swapTradeParams
            );

            estimatedGas = new BigNumber(oneInchTrade.tx.gas);
            toTokenAmount = oneInchTrade.toTokenAmount;
        } catch (_err) {
            oneInchTrade = await this.httpClient.get<OneinchQuoteResponse>(
                `${getOneinchApiBaseUrl(from.blockchain)}/quote`,
                quoteTradeParams
            );
            if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
                throw new RubicSdkError('1inch quote error');
            }

            estimatedGas = new BigNumber(oneInchTrade.estimatedGas);
            toTokenAmount = oneInchTrade.toTokenAmount;
        }

        const path = await this.extractPath(from, toToken, oneInchTrade);

        return { toTokenAmount: new BigNumber(toTokenAmount), estimatedGas, path };
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

        const tokensPath = await this.getWeb3Public(fromToken.blockchain).callForTokens(
            addressesPath
        );

        return [fromToken, ...tokensPath, toToken];
    }
}
