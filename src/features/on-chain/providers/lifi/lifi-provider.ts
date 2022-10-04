import LIFI, { Route, RouteOptions, RoutesRequest, Step } from '@lifi/sdk';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { LifiCalculationOptions } from 'src/features/on-chain/providers/lifi/models/lifi-calculation-options';
import { GasFeeInfo } from 'src/features/on-chain/providers/abstract/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { LifiTrade } from 'src/features/on-chain/providers/lifi/lifi-trade';
import { OnChainTrade } from 'src/features/on-chain/providers/abstract/on-chain-trade/on-chain-trade';
import { lifiProviders } from 'src/features/on-chain/providers/lifi/constants/lifi-providers';
import { Injector } from 'src/core/injector/injector';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { combineOptions } from 'src/common/utils/options';
import { OnChainTradeType } from 'src/features/on-chain/providers/models/on-chain-trade-type';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

export class LifiProvider {
    private readonly lifi = new LIFI();

    private readonly defaultOptions: Required<LifiCalculationOptions> = {
        gasCalculation: 'calculate',
        slippageTolerance: 0.02
    };

    constructor() {}

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        disabledProviders: OnChainTradeType[],
        options?: LifiCalculationOptions
    ): Promise<OnChainTrade[]> {
        const fullOptions: Required<LifiCalculationOptions> = combineOptions(
            options,
            this.defaultOptions
        );

        const fromChainId = blockchainId[from.blockchain];
        const toChainId = blockchainId[toToken.blockchain];

        const lifiDisabledProviders = Object.entries(lifiProviders)
            .filter(([_lifiProviderKey, tradeType]: [string, OnChainTradeType]) =>
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
                            : this.getGasFeeInfo(from, to, route),
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
                        route,
                        toTokenWeiAmountMin: new BigNumber(route.toAmountMin)
                    });
                })
            )
        ).filter(notNull);
    }

    private async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        route: Route
    ): Promise<GasFeeInfo | null> {
        try {
            const gasData = await LifiTrade.getGasData(from, to, route);
            if (!gasData) {
                return null;
            }

            const { gasLimit, gasPrice } = gasData;

            const nativeCoinPrice = await Injector.coingeckoApi.getNativeCoinPrice(from.blockchain);

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

    private async getPath(
        step: Step,
        from: Token<EvmBlockchainName>,
        to: Token
    ): Promise<ReadonlyArray<Token>> {
        const estimatedPath = step.estimate.data.path;
        return estimatedPath
            ? await Token.createTokens(estimatedPath, from.blockchain)
            : [from, to];
    }
}
