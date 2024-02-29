import { LiFi, RouteOptions, RoutesRequest } from '@lifi/sdk';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { combineOptions } from 'src/common/utils/options';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { getLifiConfig } from 'src/features/common/providers/lifi/constants/lifi-config';
import { lifiForbiddenBlockchains } from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/constants/lifi-forbidden-blockchains';
import { lifiProviders } from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/constants/lifi-providers';
import { LifiTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/lifi-trade';
import {
    LifiCalculationOptions,
    RequiredLifiCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/models/lifi-calculation-options';
import { LifiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/models/lifi-trade-struct';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';

export class LifiProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.LIFI;

    private readonly lifi = new LiFi(getLifiConfig());

    private readonly defaultOptions: Omit<RequiredLifiCalculationOptions, 'disabledProviders'> = {
        ...evmProviderDefaultOptions,
        gasCalculation: 'calculate'
    };

    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return !lifiForbiddenBlockchains.some(forbiddenChain => forbiddenChain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: LifiCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError('Blockchain is not supported');
        }

        if (options.withDeflation.from.isDeflation) {
            throw new RubicSdkError('[RUBIC_SDK] Lifi does not work if source token is deflation.');
        }

        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            disabledProviders: [...options.disabledProviders, ON_CHAIN_TRADE_TYPE.DODO]
        });

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const fromChainId = blockchainId[from.blockchain];
        const toChainId = blockchainId[toToken.blockchain];

        const { disabledProviders } = fullOptions;
        const lifiDisabledProviders = Object.entries(lifiProviders)
            .filter(([_lifiProviderKey, tradeType]: [string, OnChainTradeType]) =>
                disabledProviders.includes(tradeType)
            )
            .map(([lifiProviderKey]) => lifiProviderKey);

        const routeOptions: RouteOptions = {
            order: 'RECOMMENDED',
            slippage: fullOptions.slippageTolerance,
            maxPriceImpact: 0.5,
            exchanges: {
                deny: lifiDisabledProviders.concat('openocean')
            }
        };

        const routesRequest: RoutesRequest = {
            fromChainId,
            fromAmount: fromWithoutFee.stringWeiAmount,
            fromTokenAddress: fromWithoutFee.address,
            toChainId,
            toTokenAddress: toToken.address,
            options: routeOptions
        };

        const result = await this.lifi.getRoutes(routesRequest);
        const { routes } = result;
        const allTrades = (
            await Promise.all(
                routes.map(async route => {
                    const step = route.steps[0];
                    if (!step) {
                        return null;
                    }
                    const type = ON_CHAIN_TRADE_TYPE.LIFI;

                    const to = new PriceTokenAmount({
                        ...toToken.asStruct,
                        weiAmount: new BigNumber(route.toAmount)
                    });
                    const path = this.getRoutePath(from, to);

                    let lifiTradeStruct: LifiTradeStruct = {
                        from,
                        to,
                        gasFeeInfo: null,
                        slippageTolerance: fullOptions.slippageTolerance!,
                        type,
                        path,
                        route,
                        toTokenWeiAmountMin: new BigNumber(route.toAmountMin),
                        useProxy: fullOptions.useProxy!,
                        proxyFeeInfo,
                        fromWithoutFee,
                        withDeflation: fullOptions.withDeflation!
                    };

                    const gasFeeInfo =
                        fullOptions.gasCalculation === 'disabled'
                            ? null
                            : await this.getGasFeeInfo(lifiTradeStruct);
                    lifiTradeStruct = {
                        ...lifiTradeStruct,
                        gasFeeInfo
                    };

                    return new LifiTrade(lifiTradeStruct, fullOptions.providerAddress);
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
    private getBestTrade(trades: LifiTrade[]): LifiTrade {
        const best = trades.sort((prev, next) =>
            next.to.tokenAmount.comparedTo(prev.to.tokenAmount)
        )[0] as LifiTrade;
        return best;
    }

    protected async getGasFeeInfo(lifiTradeStruct: LifiTradeStruct): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(lifiTradeStruct.from.blockchain);
            const gasLimit = await LifiTrade.getGasLimit(lifiTradeStruct);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }
}
