import { GasFeeInfo, TradeType } from 'src/features';
import { InstantTrade } from 'src/features/instant-trades/instant-trade';
import { BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import LIFI, { RouteOptions, RoutesRequest, Step } from '@lifi/sdk';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { combineOptions } from 'src/common/utils/options';
import { lifiProviders } from 'src/features/instant-trades/dexes/common/lifi/constants/lifi-providers';
import { notNull } from 'src/common';
import { LifiTrade } from 'src/features/instant-trades/dexes/common/lifi/lifi-trade';
import BigNumber from 'bignumber.js';
import { Injector } from 'src/core/sdk/injector';
import { Token } from 'src/core/blockchain/tokens/token';
import { LifiCalculationOptions } from 'src/features/instant-trades/dexes/common/lifi/models/lifi-calculation-options';

export class LifiProvider {
    private readonly lifi = new LIFI();

    private readonly defaultOptions: Required<LifiCalculationOptions> = {
        gasCalculation: 'calculate',
        slippageTolerance: 0.02
    };

    constructor() {}

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        disabledProviders: TradeType[],
        options?: LifiCalculationOptions
    ): Promise<InstantTrade[]> {
        const fullOptions: Required<LifiCalculationOptions> = combineOptions(
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

        return (
            await Promise.all(
                routes.map(async route => {
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

                    const [gasFeeInfo, path] = await Promise.all([
                        fullOptions.gasCalculation === 'disabled'
                            ? null
                            : this.getGasFeeInfo(step, from.blockchain),
                        this.getPath(step, from, to)
                    ]);

                    return new LifiTrade({
                        from,
                        to,
                        gasFeeInfo,
                        slippageTolerance: fullOptions.slippageTolerance,
                        contractAddress,
                        type,
                        path,
                        route
                    });
                })
            )
        ).filter(notNull);
    }

    private async getGasFeeInfo(
        step: Step,
        fromBlockchain: BlockchainName
    ): Promise<GasFeeInfo | null> {
        try {
            const gasLimit = step.estimate.gasCosts?.[0]?.limit;
            if (!gasLimit) {
                return null;
            }

            const [gasPrice, nativeCoinPrice] = await Promise.all([
                Injector.gasPriceApi.getGasPrice(fromBlockchain),
                Injector.coingeckoApi.getNativeCoinPrice(fromBlockchain)
            ]);

            const gasPriceInEth = Web3Pure.fromWei(gasPrice);
            const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);

            const gasFeeInEth = gasPriceInEth.multipliedBy(gasLimit);
            const gasFeeInUsd = gasPriceInUsd.multipliedBy(gasLimit);

            return {
                gasLimit: new BigNumber(gasLimit),
                gasPrice: new BigNumber(gasPrice),
                gasFeeInEth,
                gasFeeInUsd
            };
        } catch (_err) {
            return null;
        }
    }

    private async getPath(step: Step, from: Token, to: Token): Promise<ReadonlyArray<Token>> {
        const estimatedPath = step.estimate.data.path;
        return estimatedPath
            ? await Token.createTokens(estimatedPath, from.blockchain)
            : [from, to];
    }
}
