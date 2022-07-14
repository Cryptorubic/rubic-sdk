import { SwapCalculationOptions, TradeType } from 'src/features';
import { InstantTrade } from 'src/features/instant-trades/instant-trade';
import { BlockchainsInfo, PriceToken } from 'src/core';
import LIFI, { RouteOptions, RoutesRequest } from '@lifinance/sdk';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { combineOptions } from 'src/common/utils/options';
import { lifiProviders } from 'src/features/instant-trades/dexes/common/lifi/constants/lifi-providers';
import { notNull } from 'src/common';
import { LifiTrade } from 'src/features/instant-trades/dexes/common/lifi/lifi-trade';
import BigNumber from 'bignumber.js';

export class LifiProvider {
    private readonly lifi = new LIFI();

    private readonly defaultOptions: Required<SwapCalculationOptions> = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.02,
        wrappedAddress: EMPTY_ADDRESS,
        fromAddress: ''
    };

    constructor() {}

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        disabledProviders: TradeType[],
        options?: SwapCalculationOptions
    ): Promise<InstantTrade[]> {
        const fullOptions: Required<SwapCalculationOptions> = combineOptions(
            options,
            this.defaultOptions
        );

        const fromChainId = BlockchainsInfo.getBlockchainByName(from.blockchain).id;
        const toChainId = BlockchainsInfo.getBlockchainByName(toToken.blockchain).id;

        const lifiDisabledProviders = Object.entries(lifiProviders)
            .filter(([_lifiProviderKey, tradeType]: [string, TradeType]) =>
                disabledProviders.includes(tradeType)
            )
            .map(([lifiProviderKey]) => lifiProviderKey);

        const routeOptions: RouteOptions = {
            order: 'RECOMMENDED',
            slippage: fullOptions.slippageTolerance,
            exchanges: {
                deny: lifiDisabledProviders
            }
        };

        const routesRequest: RoutesRequest = {
            fromChainId,
            fromAmount: from.stringWeiAmount,
            fromTokenAddress: from.address,
            toChainId,
            toTokenAddress: toToken.address,
            options: routeOptions
        };

        const result = await this.lifi.getRoutes(routesRequest);
        const { routes } = result;

        return routes
            .map(route => {
                const step = route.steps[0];
                if (!step) {
                    return null;
                }

                const to = new PriceTokenAmount({
                    ...toToken.asStruct,
                    weiAmount: new BigNumber(route.toAmount)
                });

                const contractAddress = step.estimate.approvalAddress;
                const type = lifiProviders[step.toolDetails.name.toLowerCase()];
                if (!type) {
                    return null;
                }

                return new LifiTrade({
                    from,
                    to,
                    gasFeeInfo: null,
                    slippageTolerance: fullOptions.slippageTolerance,
                    contractAddress,
                    type,
                    path: [],
                    route
                });
            })
            .filter(notNull);
    }
}
