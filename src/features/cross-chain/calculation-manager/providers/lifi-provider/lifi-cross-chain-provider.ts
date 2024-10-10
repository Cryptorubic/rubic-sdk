import BigNumber from 'bignumber.js';
import { MinAmountError, NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import {
    BRIDGE_TYPE,
    bridges,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-cross-chain-supported-blockchain';
import { LifiCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-trade';
import {
    LIFI_API_CROSS_CHAIN_PROVIDERS,
    LifiSubProvider
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-bridge-types';
import {
    LIFI_API_ON_CHAIN_PROVIDERS,
    LifiApiOnChainTrade
} from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/constants/lifi-providers';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { FeeCost, LifiStep } from './models/lifi-fee-cost';
import { Route, RouteOptions, RoutesRequest } from './models/lifi-route';
import { LifiApiService } from './services/lifi-api-service';
export class LifiCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    private readonly MIN_AMOUNT_USD = new BigNumber(1);

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is LifiCrossChainSupportedBlockchain {
        return lifiCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const useProxy = options?.useProxy?.[this.type] ?? true;
        const fromBlockchain = from.blockchain as LifiCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as LifiCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        const { disabledBridges, disabledDexes } = this.mapDisabledProviders(
            options.lifiDisabledBridgeTypes || []
        );
        const routeOptions: RouteOptions = {
            slippage: options.slippageTolerance,
            order: 'RECOMMENDED',
            allowSwitchChain: false,
            bridges: { deny: disabledBridges },
            exchanges: { deny: disabledDexes },
            integrator: 'rubic'
        };

        const fromChainId = blockchainId[fromBlockchain];
        const toChainId = blockchainId[toBlockchain];

        const feeInfo = await this.getFeeInfo(
            fromBlockchain,
            options.providerAddress,
            from,
            options?.useProxy?.[this.type] ?? true
        );
        const fromWithoutFee = getFromWithoutFee(from, feeInfo.rubicProxy?.platformFee?.percent);

        const fromAddress = this.getWalletAddress(fromBlockchain);
        const toAddress = options.receiverAddress || fromAddress;
        const routesRequest: RoutesRequest = {
            fromChainId,
            fromAmount: fromWithoutFee.stringWeiAmount,
            fromTokenAddress: from.address,
            toChainId,
            toTokenAddress: toToken.address,
            options: routeOptions,
            ...(fromAddress && { fromAddress }),
            ...(toAddress && { toAddress })
        };

        const result = await LifiApiService.getRoutes(routesRequest);

        const { routes } = result;

        const bestRoute = routes.find(
            route => route.steps.length === 1 && !route.containsSwitchChain
        );

        if (!bestRoute) {
            throw new RubicSdkError('No available routes');
        }

        const providerFee = bestRoute.steps[0]!.estimate.feeCosts?.find(
            (el: FeeCost & { included?: boolean }) => el?.included === false
        );
        const nativeToken = await PriceToken.createFromToken(nativeTokensList[from.blockchain]);
        if (providerFee && providerFee.amount !== '0') {
            feeInfo.provider = {
                cryptoFee: {
                    amount: Web3Pure.fromWei(
                        new BigNumber(providerFee.amount),
                        providerFee.token.decimals
                    ),
                    token: nativeToken
                }
            };
        }

        from = new PriceTokenAmount({
            ...from.asStructWithAmount,
            price: new BigNumber(bestRoute.fromAmountUSD).dividedBy(from.tokenAmount)
        });
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(bestRoute.toAmount)
        });

        const priceImpact = from.calculatePriceImpactPercent(to);

        const gasData =
            options.gasCalculation === 'enabled'
                ? await LifiCrossChainTrade.getGasData(
                      from,
                      to,
                      bestRoute,
                      feeInfo,
                      options.slippageTolerance,
                      options.providerAddress,
                      options.receiverAddress
                  )
                : null;

        const { onChainType, bridgeType } = this.parseTradeTypes(bestRoute.steps);

        const trade = new LifiCrossChainTrade(
            {
                from,
                to,
                route: bestRoute,
                gasData,
                toTokenAmountMin: Web3Pure.fromWei(bestRoute.toAmountMin, to.decimals),
                feeInfo,
                priceImpact,
                onChainSubtype: onChainType,
                bridgeType: bridgeType || BRIDGE_TYPE.LIFI,
                slippage: options.slippageTolerance
            },
            options.providerAddress,
            await this.getRoutePath(from, to, bestRoute),
            useProxy
        );

        try {
            this.checkMinError(from);
        } catch (err) {
            return {
                trade,
                error: err,
                tradeType: this.type
            };
        }

        return {
            trade,
            tradeType: this.type
        };
    }

    private checkMinError(from: PriceTokenAmount): void | never {
        const fromUsdAmount = from.price.multipliedBy(from.tokenAmount);
        if (fromUsdAmount.lt(this.MIN_AMOUNT_USD)) {
            if (from.price.gt(0)) {
                const minTokenAmount = this.MIN_AMOUNT_USD.multipliedBy(from.tokenAmount).dividedBy(
                    fromUsdAmount
                );
                throw new MinAmountError(minTokenAmount, from.symbol);
            }
            throw new MinAmountError(this.MIN_AMOUNT_USD, 'USDC');
        }
    }

    protected async getFeeInfo(
        fromBlockchain: LifiCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    private parseTradeTypes(bestRouteSteps: LifiStep[]): {
        onChainType: { from: OnChainTradeType | undefined; to: OnChainTradeType | undefined };
        bridgeType: BridgeType | undefined;
    } {
        if (!bestRouteSteps[0]) {
            return {
                onChainType: { from: undefined, to: undefined },
                bridgeType: undefined
            };
        }

        const steps = bestRouteSteps[0].includedSteps;

        if (!steps[0]) {
            return {
                onChainType: { from: undefined, to: undefined },
                bridgeType: undefined
            };
        }

        const sourceDex =
            steps[0].action.fromChainId === steps[0].action.toChainId
                ? steps?.[0].toolDetails.name.toLowerCase()
                : undefined;

        const targetDex = steps
            ?.slice(1)
            ?.find(provider => provider.action.fromChainId === provider.action.toChainId)
            ?.toolDetails.name.toLowerCase();

        let subType = bestRouteSteps
            ?.find(provider => provider.action.fromChainId !== provider.action.toChainId)
            ?.tool.toLowerCase();

        subType = subType === 'amarok' ? BRIDGE_TYPE.AMAROK : subType;

        const onChainType = {
            from: sourceDex
                ? LIFI_API_ON_CHAIN_PROVIDERS[sourceDex as LifiApiOnChainTrade]
                : undefined,
            to: targetDex
                ? LIFI_API_ON_CHAIN_PROVIDERS[targetDex as LifiApiOnChainTrade]
                : undefined
        };
        const bridgeType = bridges.find(bridge => bridge.toLowerCase() === subType);

        return {
            onChainType,
            bridgeType
        };
    }

    private mapDisabledProviders(disabledProviders: LifiSubProvider[]): {
        disabledBridges: LifiSubProvider[];
        disabledDexes: LifiSubProvider[];
    } {
        const disabledBridges = [] as LifiSubProvider[];
        const disabledDexes = [] as LifiSubProvider[];

        for (let i = 0; i < disabledProviders.length; i++) {
            const provider = disabledProviders[i] as LifiSubProvider;
            const isBridge = Object.values(LIFI_API_CROSS_CHAIN_PROVIDERS).includes(provider);
            if (isBridge) {
                disabledBridges.push(provider);
                continue;
            }
            const isDex = Object.keys(LIFI_API_ON_CHAIN_PROVIDERS).includes(provider);
            if (isDex) {
                disabledDexes.push(provider);
            }
        }

        return { disabledBridges, disabledDexes };
    }

    protected async getRoutePath(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        route: Route
    ): Promise<RubicStep[]> {
        const lifiSteps = (route.steps[0] as LifiStep).includedSteps;
        const crossChainStep = lifiSteps.find(el => el.type === 'cross')!;

        const fromTransit = crossChainStep.action.fromToken.address;
        const toTransit = crossChainStep.action.toToken.address;

        const fromTokenAmount = await TokenAmount.createToken({
            address: fromTransit,
            blockchain: from.blockchain,
            weiAmount: new BigNumber(crossChainStep.action.fromAmount)
        });

        const toTokenAmount = await TokenAmount.createToken({
            address: toTransit,
            blockchain: to.blockchain,
            weiAmount: new BigNumber(crossChainStep.estimate.toAmount)
        });

        // @TODO Add dex true provider and path
        const routePath: RubicStep[] = [];

        if (lifiSteps?.[0]?.type === 'swap') {
            routePath.push({
                type: 'on-chain',
                path: [from, fromTokenAmount],
                provider: ON_CHAIN_TRADE_TYPE.LIFI
            });
        }

        routePath.push({
            type: 'cross-chain',
            path: [fromTokenAmount, toTokenAmount],
            provider: CROSS_CHAIN_TRADE_TYPE.LIFI
        });

        if (lifiSteps?.[2]?.type === 'swap') {
            routePath.push({
                type: 'on-chain',
                path: [toTokenAmount, to],
                provider: ON_CHAIN_TRADE_TYPE.LIFI
            });
        }

        return routePath;
    }
}
