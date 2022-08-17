import { CROSS_CHAIN_TRADE_TYPE, LiFiTradeSubtype, TradeType } from 'src/features';
import { BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import BigNumber from 'bignumber.js';
import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import LIFI, { Route, RouteOptions } from '@lifi/sdk';
import { LifiCrossChainTrade } from 'src/features/cross-chain/providers/lifi-trade-provider/lifi-cross-chain-trade';
import { Injector } from 'src/core/sdk/injector';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { lifiContractAddress } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-contract-data';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { getLifiConfig } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-config';
import { CrossChainIsUnavailableError } from 'src/common';
import { CrossChainMinAmountError } from 'src/common/errors/cross-chain/cross-chain-min-amount.error';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import { LifiStep } from '@lifi/types/dist/step';
import { lifiProviders } from 'src/features/instant-trades/dexes/common/lifi/constants/lifi-providers';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';

export class LifiCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is LifiCrossChainSupportedBlockchain {
        return lifiCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    private readonly lifi = new LIFI(getLifiConfig());

    private readonly MIN_AMOUNT_USD = new BigNumber(30);

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            LifiCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            LifiCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
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
            !LifiCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !LifiCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        await this.checkContractState(fromBlockchain);

        const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);

        const feeAmount = Web3Pure.toWei(
            from.tokenAmount.multipliedBy(feeInfo.platformFee.percent).dividedBy(100),
            from.decimals,
            1
        );
        const tokenAmountIn = from.weiAmount.minus(feeAmount).toFixed(0);

        const routeOptions: RouteOptions = {
            slippage: options.slippageTolerance,
            order: 'RECOMMENDED',
            allowSwitchChain: false
        };

        const fromChainId = BlockchainsInfo.getBlockchainByName(fromBlockchain).id;
        const toChainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id;

        const routesRequest = {
            fromChainId,
            fromAmount: tokenAmountIn,
            fromTokenAddress: from.address,
            toChainId,
            toTokenAddress: toToken.address,
            options: routeOptions
        };

        const result = await this.lifi.getRoutes(routesRequest);
        const { routes } = result;

        const bestRoute = routes.find(route => !route.containsSwitchChain);

        if (!bestRoute) {
            return null;
        }

        const { fromAmountUSD, toAmountUSD } = bestRoute;
        const priceImpact = new BigNumber(fromAmountUSD)
            .minus(toAmountUSD)
            .dividedBy(fromAmountUSD)
            .dp(2)
            .toNumber();

        from = new PriceTokenAmount({
            ...from.asStructWithAmount,
            price: new BigNumber(bestRoute.fromAmountUSD).dividedBy(from.tokenAmount)
        });
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(bestRoute.toAmount)
        });
        const gasData =
            options.gasCalculation === 'enabled'
                ? await LifiCrossChainTrade.getGasData(from, to, bestRoute)
                : null;

        const { itType, subType } = this.parseTradeTypes(bestRoute);

        const trade = new LifiCrossChainTrade(
            {
                from,
                to,
                route: bestRoute,
                gasData,
                toTokenAmountMin: Web3Pure.fromWei(bestRoute.toAmountMin, to.decimals),
                feeInfo,
                priceImpact,
                itType,
                subType
            },
            options.providerAddress
        );

        try {
            this.checkMinError(from);
        } catch (err) {
            return {
                trade,
                error: err
            };
        }

        return {
            trade
        };
    }

    private async checkContractState(fromBlockchain: LifiCrossChainSupportedBlockchain) {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<number>(
            lifiContractAddress[fromBlockchain].rubicRouter,
            commonCrossChainAbi,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    private checkMinError(from: PriceTokenAmount): void | never {
        if (from.price.multipliedBy(from.tokenAmount).lt(this.MIN_AMOUNT_USD)) {
            throw new CrossChainMinAmountError(this.MIN_AMOUNT_USD, 'USDC');
        }
    }

    protected async getFeeInfo(
        fromBlockchain: LifiCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    lifiContractAddress[fromBlockchain].rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    lifiContractAddress[fromBlockchain].rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
        };
    }

    private parseTradeTypes(route: Route): {
        subType: LiFiTradeSubtype;
        itType: { from: TradeType | undefined; to: TradeType | undefined };
    } {
        const steps =
            route.steps.length === 1 ? (route.steps[0] as LifiStep).includedSteps : route.steps;
        const sourceDex =
            steps?.[0] && steps[0].action.fromChainId === steps[0].action.toChainId
                ? steps?.[0].toolDetails.name.toLowerCase()
                : undefined;

        const [, ...stepsWithoutFirst] = steps;
        const targetDex = stepsWithoutFirst
            .find(provider => provider.action.fromChainId === provider.action.toChainId)
            ?.toolDetails.name.toLowerCase();

        const subType = steps?.find(
            provider => provider.action.fromChainId !== provider.action.toChainId
        )?.tool as LiFiTradeSubtype;

        const itType = {
            from: sourceDex ? lifiProviders[sourceDex] : undefined,
            to: targetDex ? lifiProviders[targetDex] : undefined
        };

        return {
            subType,
            itType
        };
    }
}
