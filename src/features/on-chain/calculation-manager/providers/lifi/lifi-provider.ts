import { LiFi, LifiStep, RouteOptions, RoutesRequest } from '@lifi/sdk';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { combineOptions } from 'src/common/utils/options';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { getLifiConfig } from 'src/features/common/providers/lifi/constants/lifi-config';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainProxyService } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/on-chain-proxy-service';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import {
    LifiForbiddenBlockchains,
    lifiForbiddenBlockchains
} from 'src/features/on-chain/calculation-manager/providers/lifi/constants/lifi-forbidden-blockchains';
import { lifiProviders } from 'src/features/on-chain/calculation-manager/providers/lifi/constants/lifi-providers';
import { LifiTrade } from 'src/features/on-chain/calculation-manager/providers/lifi/lifi-trade';
import {
    LifiCalculationOptions,
    RequiredLifiCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/lifi/models/lifi-calculation-options';
import { LifiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/lifi/models/lifi-trade-struct';

export class LifiProvider {
    private readonly lifi = new LiFi(getLifiConfig());

    private readonly onChainProxyService = new OnChainProxyService();

    private readonly defaultOptions: Omit<RequiredLifiCalculationOptions, 'disabledProviders'> = {
        ...evmProviderDefaultOptions,
        gasCalculation: 'calculate'
    };

    constructor() {}

    private isForbiddenBlockchain(
        blockchain: BlockchainName
    ): blockchain is LifiForbiddenBlockchains {
        return lifiForbiddenBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: LifiCalculationOptions
    ): Promise<OnChainTrade[]> {
        if (this.isForbiddenBlockchain(from.blockchain)) {
            throw new RubicSdkError('Blockchain is not supported');
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

        return (
            await Promise.all(
                routes.map(async route => {
                    const step = route.steps[0];
                    if (!step) {
                        return null;
                    }
                    const type = lifiProviders[step.toolDetails.name.toLowerCase()];
                    if (!type) {
                        return null;
                    }

                    const to = new PriceTokenAmount({
                        ...toToken.asStruct,
                        weiAmount: new BigNumber(route.toAmount)
                    });
                    const path = await this.getPath(step, from, to);

                    let lifiTradeStruct: LifiTradeStruct = {
                        from,
                        to,
                        gasFeeInfo: null,
                        slippageTolerance: fullOptions.slippageTolerance,
                        type,
                        path,
                        route,
                        toTokenWeiAmountMin: new BigNumber(route.toAmountMin),
                        useProxy: fullOptions.useProxy,
                        proxyFeeInfo,
                        fromWithoutFee,
                        withDeflation: fullOptions.withDeflation
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
    }

    protected async handleProxyContract(
        from: PriceTokenAmount<EvmBlockchainName>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }> {
        let fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            proxyFeeInfo = await this.onChainProxyService.getFeeInfo(
                from,
                fullOptions.providerAddress
            );
            fromWithoutFee = getFromWithoutFee(from, proxyFeeInfo.platformFee.percent);
        } else {
            fromWithoutFee = from;
        }
        return {
            fromWithoutFee,
            proxyFeeInfo
        };
    }

    private async getGasFeeInfo(lifiTradeStruct: LifiTradeStruct): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(lifiTradeStruct.from.blockchain);
            const gasLimit = await LifiTrade.getGasLimit(lifiTradeStruct);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }

    private async getPath(
        step: LifiStep,
        from: Token<EvmBlockchainName>,
        to: Token
    ): Promise<ReadonlyArray<Token>> {
        const estimatedPath = step.includedSteps
            .map(item => {
                return [item.action.fromToken.address, item.action.toToken.address];
            })
            .flat();

        return estimatedPath
            ? await Token.createTokens(estimatedPath, from.blockchain)
            : [from, to];
    }
}
