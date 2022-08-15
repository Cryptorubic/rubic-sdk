import {
    ViaCrossChainSupportedBlockchain,
    viaCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/via-trade-provider/constants/via-cross-chain-supported-blockchain';
import { Via } from '@viaprotocol/router-sdk';
import { DEFAULT_API_KEY } from 'src/features/cross-chain/providers/via-trade-provider/constants/default-api-key';
import { ViaCrossChainTrade } from 'src/features/cross-chain/providers/via-trade-provider/via-cross-chain-trade';
import { BlockchainName, BlockchainsInfo, PriceToken, PriceTokenAmount, Web3Pure } from 'src/core';
import { Injector } from 'src/core/sdk/injector';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { BridgeType, CROSS_CHAIN_TRADE_TYPE, TRADE_TYPE, TradeType } from 'src/features';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import BigNumber from 'bignumber.js';
import {
    IActionStepTool,
    IGetRoutesRequestParams,
    IGetRoutesResponse,
    IRoute
} from '@viaprotocol/router-sdk/dist/types';
import { ItType } from 'src/features/cross-chain/models/it-type';
import { bridges } from 'src/features/cross-chain/constants/bridge-type';
import { NATIVE_TOKEN_ADDRESS } from 'src/core/blockchain/constants/native-token-address';

interface ToolType extends IActionStepTool {
    type: 'swap' | 'cross';
}

export class ViaCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ViaCrossChainSupportedBlockchain {
        return viaCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    private readonly viaConfig = {
        apiKey: DEFAULT_API_KEY,
        url: 'https://router-api.via.exchange'
    };

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            ViaCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            ViaCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !ViaCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !ViaCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            const fromChainId = BlockchainsInfo.getBlockchainByName(fromBlockchain).id;
            const toChainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id;

            const via = new Via({
                ...this.viaConfig,
                timeout: options.timeout
            });

            const pages = await via.routesPages();
            const params: IGetRoutesRequestParams = {
                fromChainId,
                fromTokenAddress: from.address,
                fromAmount: parseInt(from.stringWeiAmount),
                toChainId,
                toTokenAddress: toToken.address,
                fromAddress: options.fromAddress || this.walletAddress,
                multiTx: false,
                limit: 1
            };
            const wrappedRoutes = await Promise.allSettled(
                [...Array(pages)].map((_, i) =>
                    via.getRoutes({
                        ...params,
                        offset: i + 1
                    })
                )
            );
            const routes = (
                wrappedRoutes.filter(
                    wrappedRoute =>
                        wrappedRoute.status === 'fulfilled' && wrappedRoute.value.routes.length
                ) as PromiseFulfilledResult<IGetRoutesResponse>[]
            )
                .map(wrappedRoute => wrappedRoute.value.routes)
                .flat();
            if (!routes.length) {
                return null;
            }

            const bestRoute = await this.getBestRoute(fromBlockchain, toToken, routes);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(bestRoute.toTokenAmount)
            });
            const toTokenAmountMin = to.weiAmountMinusSlippage(bestRoute.slippage || 0);

            const gasData = options.gasCalculation === 'enabled' ? null : null;

            const cryptoFeeAmount = Web3Pure.fromWei(
                bestRoute.actions[0]?.additionalProviderFee?.amount.toString() || 0
            );
            const cryptoFeeSymbol = bestRoute.actions[0]?.additionalProviderFee?.token.symbol;
            const cryptoFee = cryptoFeeSymbol
                ? {
                      amount: cryptoFeeAmount,
                      tokenSymbol: cryptoFeeSymbol
                  }
                : null;

            const itType = this.parseItProviders(bestRoute);
            const bridgeType = this.parseBridge(bestRoute);

            return {
                trade: new ViaCrossChainTrade(
                    {
                        from,
                        to,
                        route: bestRoute,
                        gasData,
                        priceImpact: 0,
                        toTokenAmountMin,
                        cryptoFee,
                        itType,
                        bridgeType
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainTradeProvider.parseError(err)
            };
        }
    }

    private async getBestRoute(
        fromBlockchain: BlockchainName,
        toToken: PriceToken,
        routes: IRoute[]
    ): Promise<IRoute> {
        const shouldCalculateNativeTokenPrice = routes.some(route =>
            Boolean(route.actions[0]?.additionalProviderFee)
        );
        const [toTokenPrice, nativeTokenPrice] = await Promise.all([
            this.getTokenPrice(toToken),
            shouldCalculateNativeTokenPrice
                ? this.getTokenPrice({ blockchain: fromBlockchain, address: NATIVE_TOKEN_ADDRESS })
                : null
        ]);

        const sortedRoutes = routes.sort((routeA, routeB) => {
            if (!toTokenPrice) {
                return new BigNumber(routeB.toTokenAmount).comparedTo(routeA.toTokenAmount);
            }

            const nativeTokenAmountA = routeA.actions[0]?.additionalProviderFee?.amount;
            const nativeTokenAmountB = routeB.actions[0]?.additionalProviderFee?.amount;

            const routeProfitA = toTokenPrice
                .multipliedBy(routeA.toTokenAmount)
                .minus(nativeTokenPrice?.multipliedBy(nativeTokenAmountA?.toString() || 0) || 0);
            const routeProfitB = toTokenPrice
                .multipliedBy(routeB.toTokenAmount)
                .minus(nativeTokenPrice?.multipliedBy(nativeTokenAmountB?.toString() || 0) || 0);

            return routeProfitB.comparedTo(routeProfitA);
        });
        return sortedRoutes[0]!;
    }

    private getTokenPrice(token: {
        blockchain: BlockchainName;
        address: string;
        price?: BigNumber;
    }): Promise<BigNumber | null> {
        const chainId = BlockchainsInfo.getBlockchainByName(token.blockchain).id;
        const { address } = token;

        return Injector.httpClient
            .get<{ [chainId: number]: { [address: string]: { USD: number } } }>(
                'https://explorer-api.via.exchange/v1/token_price',
                {
                    params: {
                        chain: chainId,
                        tokens_addresses: token.address
                    }
                }
            )
            .then(response => new BigNumber(response[chainId]![address]!.USD))
            .catch(() => token.price || null);
    }

    private parseItProviders(route: IRoute): ItType {
        const steps = route.actions[0]?.steps;

        const firstStep = steps?.[0];
        const firstItProvider =
            (firstStep?.tool as ToolType).type === 'swap' ? firstStep?.tool.name : undefined;

        const lastStep = steps?.reverse()[0];
        const secondItProvider =
            steps?.length && steps.length > 1 && (lastStep?.tool as ToolType).type === 'swap'
                ? lastStep?.tool.name
                : undefined;

        return {
            from: this.parseTradeType(firstItProvider),
            to: this.parseTradeType(secondItProvider)
        };
    }

    private parseTradeType(type: string | undefined): TradeType | undefined {
        if (!type) {
            return undefined;
        }

        type = type.toUpperCase();
        const foundType = Object.values(TRADE_TYPE).find(
            tradeType => tradeType.split('_').join('') === type
        );
        if (foundType) {
            return foundType;
        }

        switch (type) {
            case '1INCH':
                return TRADE_TYPE.ONE_INCH;
            case '1SOL':
                return TRADE_TYPE.ONE_SOL;
            case 'DODOEX':
                return TRADE_TYPE.DODO;
            case 'TRADERJOE':
                return TRADE_TYPE.JOE;
            case 'UNISWAP':
                return TRADE_TYPE.UNISWAP_V2;
            default:
                return undefined;
        }
    }

    private parseBridge(route: IRoute): BridgeType {
        const bridgeApi = route.actions[0]?.steps.find(
            step => (step.tool as ToolType).type === 'cross'
        )?.tool.name;
        if (!bridgeApi) {
            return undefined;
        }

        return bridges.find(bridge => bridge === bridgeApi.split(' ')[0]?.toLowerCase());
    }
}
