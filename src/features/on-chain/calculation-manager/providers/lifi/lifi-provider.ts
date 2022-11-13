import LIFI, { Route, RouteOptions, RoutesRequest, Step } from '@lifi/sdk';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    LifiCalculationOptions,
    RequiredLifiCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/lifi/models/lifi-calculation-options';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { LifiTrade } from 'src/features/on-chain/calculation-manager/providers/lifi/lifi-trade';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { lifiProviders } from 'src/features/on-chain/calculation-manager/providers/lifi/constants/lifi-providers';
import { combineOptions } from 'src/common/utils/options';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { OnChainProxyService } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/on-chain-proxy-service';
import { OnChainIsUnavailableError } from 'src/common/errors/on-chain';
import { getLifiConfig } from 'src/features/common/providers/lifi/constants/lifi-config';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';

export class LifiProvider {
    private readonly lifi = new LIFI(getLifiConfig());

    private readonly onChainProxyService = new OnChainProxyService();

    private readonly defaultOptions: Omit<RequiredLifiCalculationOptions, 'disabledProviders'> = {
        gasCalculation: 'calculate',
        slippageTolerance: 0.02,
        providerAddress: EvmWeb3Pure.EMPTY_ADDRESS,
        useProxy: false
    };

    constructor() {}

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: LifiCalculationOptions
    ): Promise<OnChainTrade[]> {
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            disabledProviders: options.disabledProviders
        });

        if (fullOptions.useProxy) {
            await this.checkContractState(from.blockchain);
        }

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

                    const type = lifiProviders[step.toolDetails.name.toLowerCase()];
                    if (!type) {
                        return null;
                    }

                    const [gasFeeInfo, path] = await Promise.all([
                        fullOptions.gasCalculation === 'disabled'
                            ? null
                            : this.getGasFeeInfo(from, to, route, fullOptions.useProxy),
                        this.getPath(step, from, to)
                    ]);

                    return new LifiTrade(
                        {
                            from,
                            to,
                            gasFeeInfo,
                            slippageTolerance: fullOptions.slippageTolerance,
                            type,
                            path,
                            route,
                            toTokenWeiAmountMin: new BigNumber(route.toAmountMin)
                        },
                        fullOptions.useProxy,
                        fullOptions.providerAddress
                    );
                })
            )
        ).filter(notNull);
    }

    private async checkContractState(fromBlockchain: EvmBlockchainName): Promise<void | never> {
        const isPaused = await this.onChainProxyService.isContractPaused(fromBlockchain);
        if (isPaused) {
            throw new OnChainIsUnavailableError();
        }
    }

    private async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        route: Route,
        useProxy: boolean
    ): Promise<GasFeeInfo | null> {
        const gasPriceInfo = await getGasPriceInfo(from.blockchain);
        const gasLimit = await LifiTrade.getGasLimit(from, to, route, useProxy);
        return getGasFeeInfo(gasLimit, gasPriceInfo);
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
