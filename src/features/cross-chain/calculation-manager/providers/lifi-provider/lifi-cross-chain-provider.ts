import { getLifiConfig } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-config';
import { LifiCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-trade';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-cross-chain-supported-blockchain';
import LIFI, { LifiStep, Route, RouteOptions, RoutesRequest } from '@lifi/sdk';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    bridges,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { MinAmountError, RubicSdkError } from 'src/common/errors';
import { lifiProviders } from 'src/features/on-chain/calculation-manager/providers/lifi/constants/lifi-providers';
import { lifiContractAddress } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-contract-data';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import BigNumber from 'bignumber.js';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/calculation-manager/utils/get-from-without-fee';
import { LifiBridgeTypes } from './models/lifi-bridge-types';

export class LifiCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    private readonly lifi = new LIFI(getLifiConfig());

    private readonly MIN_AMOUNT_USD = new BigNumber(30);

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
        const fromBlockchain = from.blockchain as LifiCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as LifiCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        await this.checkContractState(
            fromBlockchain,
            lifiContractAddress[fromBlockchain].rubicRouter,
            evmCommonCrossChainAbi
        );

        if (
            options.notAllowedBridgeTypes?.length &&
            !this.checkBridgeTypes(options.notAllowedBridgeTypes as LifiBridgeTypes[])
        ) {
            throw new RubicSdkError('Incorrect bridges filter param');
        }

        const routeOptions: RouteOptions = {
            slippage: options.slippageTolerance,
            order: 'RECOMMENDED',
            allowSwitchChain: false,
            bridges: {
                deny: options.notAllowedBridgeTypes
            }
        };

        const fromChainId = blockchainId[fromBlockchain];
        const toChainId = blockchainId[toBlockchain];

        const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
        const fromWithoutFee = getFromWithoutFee(from, feeInfo);

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
                bridgeType,
                notAllowedBridgeTypes: []
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
            throw new MinAmountError(this.MIN_AMOUNT_USD, 'USDC');
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
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    lifiContractAddress[fromBlockchain].rubicRouter,
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
        };
    }

    private parseTradeTypes(route: Route): {
        itType: { from: OnChainTradeType | undefined; to: OnChainTradeType | undefined };
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

    private checkBridgeTypes(notAllowedBridgeTypes: LifiBridgeTypes[]): boolean {
        return notAllowedBridgeTypes.every(bridgeType =>
            Object.values(LifiBridgeTypes).includes(bridgeType)
        );
    }
}
