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

    private readonly via = new Via({
        apiKey: DEFAULT_API_KEY,
        url: 'https://router-api.via.exchange',
        timeout: 25_000
    });

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

            const pages = await this.via.routesPages();
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
                    this.via.getRoutes({
                        ...params,
                        offset: i + 1
                    })
                )
            );
            const route = (
                wrappedRoutes.filter(
                    wrappedRoute =>
                        wrappedRoute.status === 'fulfilled' && wrappedRoute.value.routes.length
                ) as PromiseFulfilledResult<IGetRoutesResponse>[]
            )
                .map(wrappedRoute => wrappedRoute.value.routes)
                .flat()
                .sort((a, b) => new BigNumber(a.toTokenAmount).comparedTo(b.toTokenAmount))[0];

            if (!route) {
                return null;
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(route.toTokenAmount)
            });
            const toTokenAmountMin = to.weiAmountMinusSlippage(route.slippage || 0);

            const gasData = options.gasCalculation === 'enabled' ? null : null;

            const cryptoFeeAmount = Web3Pure.fromWei(
                route.actions[0]?.additionalProviderFee?.amount.toString() || 0
            );
            const cryptoFeeSymbol = route.actions[0]?.additionalProviderFee?.token.symbol;
            const cryptoFee = cryptoFeeSymbol
                ? {
                      amount: cryptoFeeAmount,
                      tokenSymbol: cryptoFeeSymbol
                  }
                : null;

            const itType = this.parseItProviders(route);
            const bridgeType = this.parseBridge(route);

            return {
                trade: new ViaCrossChainTrade(
                    {
                        from,
                        to,
                        route,
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
