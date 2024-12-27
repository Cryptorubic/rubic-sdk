import { QuoteRequestInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import pTimeout from 'src/common/utils/p-timeout';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Injector } from 'src/core/injector/injector';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';
import { getPriceTokensFromInputTokens } from 'src/features/common/utils/get-price-tokens-from-input-tokens';
import { defaultCrossChainCalculationOptions } from 'src/features/cross-chain/calculation-manager/constants/default-cross-chain-calculation-options';
import { defaultProviderAddresses } from 'src/features/cross-chain/calculation-manager/constants/default-provider-addresses';
import {
    CrossChainManagerCalculationOptions,
    RequiredCrossChainManagerCalculationOptions
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-manager-options';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { WrappedCrossChainTradeOrNull } from 'src/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { TransformUtils } from 'src/features/ws-api/transform-utils';

/**
 * Contains method to calculate best cross-chain trade.
 */
export class CrossChainManager {
    constructor(private readonly providerAddress: ProviderAddress) {}

    /**
     * Calculates cross-chain trades and sorts them by exchange courses.
     * Wrapped trade object may contain error, but sometimes course can be
     * calculated even with thrown error (e.g. min/max amount error).
     *
     * @example
     * ```ts
     * const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
     * // ETH
     * const fromTokenAddress = '0x0000000000000000000000000000000000000000';
     * const fromAmount = 1;
     * const toBlockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
     * // BUSD
     * const toTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
     *
     * const wrappedTrades = await sdk.crossChainManager.calculateTrade(
     *     { blockchain: fromBlockchain, address: fromTokenAddress },
     *     fromAmount,
     *     { blockchain: toBlockchain, address: toTokenAddress }
     * );
     * const bestTrade = wrappedTrades[0];
     *
     * wrappedTrades.forEach(wrappedTrade => {
     *    if (wrappedTrade.trade) {
     *        console.log(wrappedTrade.tradeType, `to amount: ${wrappedTrade.trade.to.tokenAmount.toFormat(3)}`));
     *    }
     *    if (wrappedTrade.error) {
     *        console.error(wrappedTrade.tradeType, 'error: wrappedTrade.error');
     *    }
     * });
     *
     * ```
     *
     * @param fromToken Token to sell.
     * @param fromAmount Amount to sell.
     * @param toToken Token to get.
     * @param options Additional options.
     * @returns Array of sorted wrapped cross-chain trades with possible errors.
     */
    public async calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              }
            | PriceToken,
        fromAmount: string | number | BigNumber,
        toToken:
            | Token
            | {
                  address: string;
                  blockchain: BlockchainName;
              }
            | PriceToken,
        options?: CrossChainManagerCalculationOptions
    ): Promise<WrappedCrossChainTrade[]> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of `from` and `to` tokens must be different.');
        }

        const { from, to } = await getPriceTokensFromInputTokens(fromToken, fromAmount, toToken);
        const { disabledProviders, ...providerOptions } = this.getFullOptions(
            from.blockchain,
            options
        );

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
                TransformUtils.transformCrossChain(route, request, providerOptions.providerAddress)
            )
        );

        // const calculationPromises = providers.map(provider =>
        //     this.getProviderCalculationPromise(provider, from, to, providerOptions)
        // );
        // const wrappedTrades = (await Promise.all(calculationPromises)).filter(notNull);
        // if (!wrappedTrades?.length) {
        //     throw new RubicSdkError('No success providers calculation for the trade');
        // }
        //
        // return wrappedTrades.sort((nextTrade, prevTrade) =>
        //     compareCrossChainTrades(nextTrade, prevTrade)
        // );
    }

    private getFullOptions(
        fromBlockchain: BlockchainName,
        options?: CrossChainManagerCalculationOptions
    ): RequiredCrossChainManagerCalculationOptions {
        const providerAddress = options?.providerAddress
            ? options.providerAddress
            : this.getProviderAddress(fromBlockchain);

        return combineOptions(
            { ...options },
            {
                ...defaultCrossChainCalculationOptions,
                providerAddress
            }
        );
    }

    private async getProviderCalculationPromise(
        provider: CrossChainProvider,
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<WrappedCrossChainTradeOrNull> {
        try {
            const wrappedTrade = await pTimeout(
                provider.calculate(from, to, options),
                options.timeout
            );
            if (!wrappedTrade) {
                return null;
            }

            return {
                ...wrappedTrade,
                tradeType: provider.type
            };
        } catch (err: unknown) {
            console.debug(
                `[RUBIC_SDK] Trade calculation error occurred for ${provider.type} trade provider.`,
                err
            );
            return {
                trade: null,
                tradeType: provider.type,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    private getProviderAddress(fromBlockchain: BlockchainName): string {
        let chainType: keyof ProviderAddress | undefined;
        try {
            chainType = BlockchainsInfo.getChainType(fromBlockchain) as keyof ProviderAddress;
        } catch {}

        let providerAddress = defaultProviderAddresses.crossChain;
        if (
            chainType &&
            this.providerAddress?.[chainType]?.crossChain &&
            this.providerAddress[chainType]!.crossChain !== undefined
        ) {
            providerAddress = this.providerAddress[chainType]!.crossChain!;
        }
        return providerAddress;
    }
}
