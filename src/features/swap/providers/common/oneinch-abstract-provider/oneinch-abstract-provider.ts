import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { NATIVE_TOKEN_ADDRESS } from '@core/blockchain/constants/native-token-address';
import { BlockchainsInfo } from '@core/blockchain/blockchains-info';
import { Injector } from '@core/sdk/injector';
import { OneinchTokensResponse } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchTokensResponse';
import { InstantTrade } from '@features/swap/trades/instant-trade';
import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { SwapOptions } from '@features/swap/models/swap-options';
import BigNumber from 'bignumber.js';
import { OneinchQuoteRequest } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchQuoteRequest';
import { OneinchQuoteResponse } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchQuoteResponse';
import { OneinchSwapResponse } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchSwapResponse';
import { OneinchSwapRequest } from '@features/swap/providers/common/oneinch-abstract-provider/models/OneinchSwapRequest';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { getGasPriceInfo } from '@features/swap/providers/common/utils/gas-price';
import { PriceToken } from '@core/blockchain/tokens/price-token';

export class OneinchAbstractProvider {
    private readonly oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    private readonly apiBaseUrl = 'https://api.1inch.exchange/v4.0/';

    private readonly httpClient = Injector.httpClient;

    private supportedTokens: string[] | undefined;

    private readonly web3Public: Web3Public;

    private get walletAddress() {
        return Injector.web3Private.address;
    }

    constructor(private readonly blockchain: BLOCKCHAIN_NAME) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    }

    private getOneInchTokenSpecificAddresses(
        fromTokenAddress: string,
        toTokenAddress: string
    ): { fromTokenAddress: string; toTokenAddress: string } {
        if (fromTokenAddress === NATIVE_TOKEN_ADDRESS) {
            fromTokenAddress = this.oneInchNativeAddress;
        }
        if (toTokenAddress === NATIVE_TOKEN_ADDRESS) {
            toTokenAddress = this.oneInchNativeAddress;
        }
        return { fromTokenAddress, toTokenAddress };
    }

    private async getSupportedTokensByBlockchain(): Promise<string[]> {
        if (this.supportedTokens) {
            return this.supportedTokens;
        }

        const blockchainId = BlockchainsInfo.getBlockchainByName(this.blockchain).id;
        const oneinchTokensResponse: OneinchTokensResponse = await this.httpClient.get(
            `${this.apiBaseUrl}${blockchainId}/tokens`
        );
        const supportedTokensByBlockchain = Object.keys(oneinchTokensResponse.tokens).map(
            tokenAddress => tokenAddress.toLowerCase()
        );
        this.supportedTokens = supportedTokensByBlockchain;

        return supportedTokensByBlockchain;
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
    ): Promise<InstantTrade> {
        const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
            from.address,
            toToken.address
        );

        const supportedTokensAddresses = await this.getSupportedTokensByBlockchain();
        if (
            !supportedTokensAddresses.includes(fromTokenAddress.toLowerCase()) ||
            !supportedTokensAddresses.includes(toTokenAddress.toLowerCase())
        ) {
            throw new RubicSdkError("Oneinch doesn't support this tokens");
        }

        const { toTokenAmount, estimatedGas, path } = await this.getTradeInfo(
            from,
            toToken,
            options
        );

        const instantTrade: InstantTrade = {
            from,
            to: new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toTokenAmount
            }),
            gasFeeInfo: null,
            slippageTolerance: options.slippageTolerance,
            path
        };
        if (options.gasCalculation === 'disabled') {
            return instantTrade;
        }

        const gasPriceInfo = await getGasPriceInfo(this.blockchain);
        const gasFeeInEth = gasPriceInfo.gasPriceInEth.multipliedBy(estimatedGas);
        const gasFeeInUsd = gasPriceInfo.gasPriceInUsd.multipliedBy(estimatedGas);

        return {
            ...instantTrade,
            gasFeeInfo: {
                gasLimit: estimatedGas.toFixed(0),
                gasPrice: gasPriceInfo.gasPrice,
                gasFeeInUsd,
                gasFeeInEth
            }
        };
    }

    private async getTradeInfo(
        from: PriceTokenAmount,
        toToken: Token,
        options: SwapOptions
    ): Promise<{ toTokenAmount: BigNumber; estimatedGas: BigNumber; path: Token[] }> {
        const blockchainId = BlockchainsInfo.getBlockchainByName(this.blockchain).id;
        const quoteTradeParams: OneinchQuoteRequest = {
            params: {
                fromTokenAddress: from.address,
                toTokenAddress: toToken.address,
                amount: from.stringWeiAmount
            }
        };
        if (options.disableMultihops) {
            quoteTradeParams.params.mainRouteParts = '1';
        }

        let oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse;
        let estimatedGas: BigNumber;
        let toTokenAmount: string;
        try {
            if (!this.walletAddress) {
                throw new Error('User has not connected');
            }

            if (from.address !== this.oneInchNativeAddress) {
                const response = await this.httpClient.get<{
                    allowance: string;
                }>(`${this.apiBaseUrl}${blockchainId}/approve/allowance`, {
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
                `${this.apiBaseUrl}${blockchainId}/swap`,
                swapTradeParams
            );

            estimatedGas = new BigNumber(oneInchTrade.tx.gas);
            toTokenAmount = oneInchTrade.toTokenAmount;
        } catch (_err) {
            oneInchTrade = await this.httpClient.get<OneinchQuoteResponse>(
                `${this.apiBaseUrl}${blockchainId}/quote`,
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
        const tokensPath = await this.web3Public.callForTokens(addressesPath);

        return [fromToken, ...tokensPath, toToken];
    }
}
