import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { LifiUtilsService } from 'src/features/common/providers/lifi/lifi-utils-service';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { getSolanaFee } from 'src/features/common/utils/get-solana-fee';
import { LifiStep } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-fee-cost';
import {
    RouteOptions,
    RoutesRequest
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-route';
import {
    LIFI_API_ON_CHAIN_PROVIDERS,
    LIFI_DISABLED_ON_CHAIN_PROVIDERS
} from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/constants/lifi-providers';
import {
    LifiOnChainSupportedBlockchain,
    lifiOnChainSupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/constants/lifi-supported-blockchains';
import {
    LifiCalculationOptions,
    RequiredLifiCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/models/lifi-calculation-options';
import {
    LifiEvmOnChainTradeStruct,
    LifiSolanaOnChainTradeStruct
} from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/models/lifi-trade-struct';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { LifiEvmOnChainTrade } from './chains/lifi-evm-on-chain-trade';
import { LifiOnChainFactory } from './lifi-on-chain-factory';
import { LifiOnChainApiService } from './services/lifi-on-chain-api-service';
export class LifiProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.LIFI;

    private readonly defaultOptions: Omit<RequiredLifiCalculationOptions, 'disabledProviders'> = {
        ...evmProviderDefaultOptions,
        gasCalculation: 'calculate'
    };

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return lifiOnChainSupportedBlockchains.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>,
        options: LifiCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (options.withDeflation.from.isDeflation) {
            throw new RubicSdkError('[RUBIC_SDK] Lifi does not work if source token is deflation.');
        }
        const fromBlockchain = from.blockchain as LifiOnChainSupportedBlockchain;
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            disabledProviders: [...options.disabledProviders, ON_CHAIN_TRADE_TYPE.DODO]
        });

        const { fromWithoutFee: fromWithoutEvmFee, proxyFeeInfo } = await this.handleProxyContract(
            from,
            fullOptions
        );

        const feeSolanaPercent = getSolanaFee(from) * 100;
        const fromWithoutSolanaFee = getFromWithoutFee(from, feeSolanaPercent);

        const fromWithoutFee =
            from.blockchain === BLOCKCHAIN_NAME.SOLANA ? fromWithoutSolanaFee : fromWithoutEvmFee;

        const fromChainId = LifiUtilsService.getLifiChainId(fromBlockchain);
        const toChainId = LifiUtilsService.getLifiChainId(fromBlockchain);

        const fromTokenAddress = LifiUtilsService.getLifiTokenAddress(
            from.blockchain,
            from.isNative,
            from.address
        );
        const toTokenAddress = LifiUtilsService.getLifiTokenAddress(
            toToken.blockchain,
            toToken.isNative,
            toToken.address
        );

        const { disabledProviders } = fullOptions;
        const lifiDisabledProviders = Object.entries(LIFI_API_ON_CHAIN_PROVIDERS)
            .filter(([_, tradeType]: [string, OnChainTradeType]) =>
                disabledProviders.includes(tradeType)
            )
            .map(([lifiProviderKey]) => lifiProviderKey)
            .concat(LIFI_DISABLED_ON_CHAIN_PROVIDERS);

        const routeOptions: RouteOptions = {
            order: 'RECOMMENDED',
            slippage: fullOptions.slippageTolerance,
            maxPriceImpact: 0.5,
            exchanges: {
                deny: lifiDisabledProviders
            },
            integrator: 'rubic'
        };

        const routesRequest: RoutesRequest = {
            fromChainId,
            fromAmount: fromWithoutFee.stringWeiAmount,
            fromTokenAddress,
            toChainId,
            toTokenAddress,
            options: routeOptions
        };

        const result = await LifiOnChainApiService.getRoutes(routesRequest);
        const { routes } = result;
        const allTrades = (
            await Promise.all(
                routes.map(async route => {
                    const step = route.steps[0];
                    if (!step) return null;

                    const to = new PriceTokenAmount({
                        ...toToken.asStruct,
                        weiAmount: new BigNumber(route.toAmount)
                    });
                    const path = this.getRoutePath(from, to);

                    const lifiTradeStruct = {
                        from,
                        to,
                        gasFeeInfo: await this.getGasFeeInfo(from, step),
                        slippageTolerance: fullOptions.slippageTolerance!,
                        type: this.tradeType,
                        path,
                        route,
                        toTokenWeiAmountMin: new BigNumber(route.toAmountMin),
                        useProxy: fullOptions.useProxy!,
                        proxyFeeInfo,
                        fromWithoutFee,
                        withDeflation: fullOptions.withDeflation!
                    };

                    return LifiOnChainFactory.createTrade(
                        fromBlockchain,
                        lifiTradeStruct as LifiEvmOnChainTradeStruct | LifiSolanaOnChainTradeStruct,
                        fullOptions.providerAddress
                    );
                })
            )
        ).filter(notNull);
        const bestTrade = this.getBestTrade(allTrades);

        return bestTrade;
    }

    /**
     * @description Lifi-aggregator provides several providers at the same time, this method chooses the most profitable trade
     * @param trades all available lifiTrades
     * @returns best trade
     */
    private getBestTrade(trades: OnChainTrade[]): LifiEvmOnChainTrade {
        const best = trades.sort((curr, prev) =>
            prev.to.tokenAmount.comparedTo(curr.to.tokenAmount)
        )[0] as LifiEvmOnChainTrade;
        return best;
    }

    protected override async getGasFeeInfo(
        from: PriceTokenAmount,
        step: LifiStep
    ): Promise<GasFeeInfo | null> {
        if (!BlockchainsInfo.isEvmBlockchainName(from.blockchain)) {
            return Promise.resolve(null);
        }

        const gasCosts = step.estimate.gasCosts;
        if (!gasCosts || !gasCosts.length) {
            return Promise.resolve(null);
        }

        let gasLimit = new BigNumber(0);

        for (const el of gasCosts) {
            gasLimit = gasLimit.plus(el.limit);
        }

        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);

            return getGasFeeInfo(gasPriceInfo, { gasLimit });
        } catch {
            return null;
        }
    }
}
