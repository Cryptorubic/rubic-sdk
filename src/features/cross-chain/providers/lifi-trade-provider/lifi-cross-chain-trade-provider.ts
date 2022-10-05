import { BridgeType, CROSS_CHAIN_TRADE_TYPE, TradeType } from 'src/features';
import { BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import BigNumber from 'bignumber.js';
import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import LIFI, { Route, RouteOptions } from '@lifi/sdk';
import { LifiCrossChainTrade } from 'src/features/cross-chain/providers/lifi-trade-provider/lifi-cross-chain-trade';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { lifiContractAddress } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-contract-data';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { getLifiConfig } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-config';
import { CrossChainMinAmountError } from 'src/common/errors/cross-chain/cross-chain-min-amount.error';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import { LifiStep } from '@lifi/types/dist/step';
import { lifiProviders } from 'src/features/instant-trades/dexes/common/lifi/constants/lifi-providers';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { bridges } from 'src/features/cross-chain/constants/bridge-type';
import { RoutesRequest } from '@lifi/types';
import { CalculationResult } from 'src/features/cross-chain/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/utils/get-from-without-fee';

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
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !LifiCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !LifiCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        await this.checkContractState(
            fromBlockchain,
            lifiContractAddress[fromBlockchain].rubicRouter
        );

        const routeOptions: RouteOptions = {
            slippage: options.slippageTolerance,
            order: 'RECOMMENDED',
            allowSwitchChain: false
        };

        const fromChainId = BlockchainsInfo.getBlockchainByName(fromBlockchain).id;
        const toChainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id;

        const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
        const fromWithoutFee = getFromWithoutFee(from, feeInfo);

        const fromAddress = this.walletAddress;
        const toAddress = options.receiverAddress || this.walletAddress;
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

        const result = await this.lifi.getRoutes(routesRequest);
        const { routes } = result;

        const bestRoute = routes.find(
            route => route.steps.length === 1 && !route.containsSwitchChain
        );

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

        const { itType, bridgeType } = this.parseTradeTypes(bestRoute);

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
                bridgeType
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

    private checkMinError(from: PriceTokenAmount): void | never {
        if (from.price.multipliedBy(from.tokenAmount).lt(this.MIN_AMOUNT_USD)) {
            throw new CrossChainMinAmountError(this.MIN_AMOUNT_USD, 'USDC');
        }
    }

    protected override async getFeeInfo(
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
        itType: { from: TradeType | undefined; to: TradeType | undefined };
        bridgeType: BridgeType | undefined;
    } {
        const steps =
            route.steps.length === 1 && (route.steps[0] as LifiStep).includedSteps
                ? (route.steps[0] as LifiStep).includedSteps
                : route.steps;
        const sourceDex =
            steps?.[0] && steps[0].action.fromChainId === steps[0].action.toChainId
                ? steps?.[0].toolDetails.name.toLowerCase()
                : undefined;

        const targetDex = steps
            ?.slice(1)
            ?.find(provider => provider.action.fromChainId === provider.action.toChainId)
            ?.toolDetails.name.toLowerCase();

        const subType = steps
            ?.find(provider => provider.action.fromChainId !== provider.action.toChainId)
            ?.tool.toLowerCase();

        const itType = {
            from: sourceDex ? lifiProviders[sourceDex] : undefined,
            to: targetDex ? lifiProviders[targetDex] : undefined
        };
        const bridgeType = bridges.find(bridge => bridge === subType);

        return {
            itType,
            bridgeType
        };
    }
}
