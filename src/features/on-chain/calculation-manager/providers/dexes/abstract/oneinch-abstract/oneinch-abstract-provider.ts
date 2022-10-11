import { OneinchSwapResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/models/oneinch-swap-response';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OneinchQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/models/oneinch-quote-response';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-calculation-options';
import { OneinchTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/oneinch-trade';
import { RubicSdkError } from 'src/common/errors';
import { createTokenNativeAddressProxy } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/utils/token-native-address-proxy';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { getOneinchApiBaseUrl } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/utils';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/constants';
import { OneinchQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/models/oneinch-quote-request';
import { combineOptions } from 'src/common/utils/options';
import { Cache } from 'src/common/utils/decorators';
import { OneinchSwapRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/models/oneinch-swap-request';
import BigNumber from 'bignumber.js';
import { OneinchCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/models/oneinch-calculation-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';

export abstract class OneinchAbstractProvider extends EvmOnChainProvider {
    private readonly defaultOptions: Omit<OneinchCalculationOptions, 'fromAddress'> = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        slippageTolerance: 0.02,
        wrappedAddress: oneinchApiParams.nativeAddress
    };

    protected readonly gasMargin = 1;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ONE_INCH;
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
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress: this.walletAddress
        });

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
        options: OneinchCalculationOptions
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
                ...(options.disableMultihops && { mainRouteParts: '1' })
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
}
