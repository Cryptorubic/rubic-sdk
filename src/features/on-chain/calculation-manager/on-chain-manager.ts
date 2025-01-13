import { QuoteRequestInterface } from '@cryptorubic/core';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Injector } from 'src/core/injector/injector';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';
import { getPriceTokensFromInputTokens } from 'src/features/common/utils/get-price-tokens-from-input-tokens';
import { defaultProviderAddresses } from 'src/features/cross-chain/calculation-manager/constants/default-provider-addresses';
import { DeflationTokenManager } from 'src/features/deflation-token-manager/deflation-token-manager';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { EvmWrapTrade } from 'src/features/on-chain/calculation-manager/common/evm-wrap-trade/evm-wrap-trade';
import { OnChainProxyService } from 'src/features/on-chain/calculation-manager/common/on-chain-proxy-service/on-chain-proxy-service';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OnChainManagerCalculationOptions } from 'src/features/on-chain/calculation-manager/models/on-chain-manager-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { RequiredOnChainManagerCalculationOptions } from 'src/features/on-chain/calculation-manager/models/required-on-chain-manager-calculation-options';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { TransformUtils } from 'src/features/ws-api/transform-utils';

/**
 * Contains methods to calculate on-chain trades.
 */
export class OnChainManager {
    private static readonly defaultCalculationTimeout = 20_000;

    private readonly deflationTokenManager = new DeflationTokenManager();

    public constructor(private readonly providerAddress: ProviderAddress) {}

    /**
     * Calculates on-chain trades, sorted by output amount.
     *
     * @example
     * ```ts
     * const blockchain = BLOCKCHAIN_NAME.ETHEREUM;
     * // ETH
     * const fromTokenAddress = '0x0000000000000000000000000000000000000000';
     * const fromAmount = 1;
     * // USDT
     * const toTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
     *
     * const trades = await sdk.onChainManager.calculateTrade(
     *     { blockchain, address: fromTokenAddress },
     *     fromAmount,
     *     toTokenAddress
     * );
     * const bestTrade = trades[0];
     *
     * trades.forEach(trade => {
     *     if (trade instanceof OnChainTrade) {
     *         console.log(trade.type, `to amount: ${trade.to.tokenAmount.toFormat(3)}`)
     *     }
     * })
     * ```
     *
     * @param fromToken Token to sell.
     * @param fromAmount Amount to sell.
     * @param toToken Token to get.
     * @param options Additional options.
     * @returns List of calculated on-chain trades.
     */
    public async calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              }
            | PriceToken,
        fromAmount: string | number,
        toToken: Token | string | PriceToken,
        options?: OnChainManagerCalculationOptions
    ): Promise<WrappedOnChainTradeOrNull[]> {
        if (toToken instanceof Token && fromToken.blockchain !== toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be same');
        }

        const { from, to } = await getPriceTokensFromInputTokens(
            fromToken,
            fromAmount.toString(),
            toToken
        );

        const fullOptions = await this.getFullOptions(from, to, options);
        if ((from.isNative && to.isWrapped) || (from.isWrapped && to.isNative)) {
            const trade = this.getWrappedWrapTrade(from, to);
            return [trade];
        }

        // @TODO API
        const request: QuoteRequestInterface = {
            srcTokenAddress: from.address,
            dstTokenBlockchain: to.blockchain,
            srcTokenBlockchain: from.blockchain,
            srcTokenAmount: from.stringWeiAmount,
            dstTokenAddress: to.address
        };
        const routes = await Injector.rubicApiService.fetchRoutes(request);

        return Promise.all(
            routes.routes.map(route =>
                TransformUtils.transformOnChain(route, request, fullOptions.providerAddress)
            )
        );
    }

    private async getFullOptions(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: OnChainManagerCalculationOptions
    ): Promise<RequiredOnChainManagerCalculationOptions> {
        const chainType = BlockchainsInfo.getChainType(from.blockchain) as keyof ProviderAddress;

        const [isDeflationFrom, isDeflationTo] = await Promise.all([
            this.isDeflationToken(from),
            this.isDeflationToken(to)
        ]);
        let useProxy: boolean;
        if (options?.useProxy === false) {
            useProxy = options.useProxy;
        } else {
            useProxy =
                OnChainProxyService.isSupportedBlockchain(from.blockchain) &&
                (!isDeflationFrom.isDeflation || isDeflationFrom.isWhitelisted);
        }

        return combineOptions<RequiredOnChainManagerCalculationOptions>(
            { ...options, useProxy },
            {
                timeout: OnChainManager.defaultCalculationTimeout,
                disabledProviders: [],
                providerAddress:
                    options?.providerAddress ||
                    this.providerAddress?.[chainType]?.onChain ||
                    defaultProviderAddresses.onChain,
                useProxy,
                withDeflation: {
                    from: isDeflationFrom,
                    to: isDeflationTo
                }
            }
        );
    }

    private isDeflationToken(token: Token): Promise<IsDeflationToken> {
        return this.deflationTokenManager.isDeflationToken(token);
    }

    public static getWrapTrade(from: PriceTokenAmount, to: PriceToken): EvmOnChainTrade {
        const fromToken = from as PriceTokenAmount<EvmBlockchainName>;
        const toToken = to as PriceToken<EvmBlockchainName>;
        return new EvmWrapTrade({
            from: fromToken,
            to: new PriceTokenAmount<EvmBlockchainName>({
                ...toToken.asStruct,
                weiAmount: from.weiAmount
            }),
            slippageTolerance: 0,
            path: [from, to],
            gasFeeInfo: null,
            useProxy: false,
            proxyFeeInfo: undefined,
            fromWithoutFee: fromToken,
            apiResponse: null,
            apiQuote: null,

            withDeflation: {
                from: { isDeflation: false },
                to: { isDeflation: false }
            }
        });
    }

    private getWrappedWrapTrade(
        fromToken: PriceTokenAmount,
        toToken: PriceToken
    ): WrappedOnChainTradeOrNull {
        const wrappedTrade: WrappedOnChainTradeOrNull = {
            error: undefined,
            trade: null,
            tradeType: ON_CHAIN_TRADE_TYPE.WRAPPED
        };
        try {
            wrappedTrade.trade = OnChainManager.getWrapTrade(fromToken, toToken);
        } catch (err: unknown) {
            wrappedTrade.error = err as RubicSdkError;
        }
        return wrappedTrade;
    }
}
