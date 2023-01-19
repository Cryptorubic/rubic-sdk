import LIFI, { LifiStep, Route, RouteOptions, RoutesRequest } from '@lifi/sdk';
import BigNumber from 'bignumber.js';
import { MinAmountError, NotWhitelistedProviderError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { wlContractAbi } from 'src/features/common/constants/wl-contract-abi';
import { wlContractAddress } from 'src/features/common/constants/wl-contract-address';
import { getLifiConfig } from 'src/features/common/providers/lifi/constants/lifi-config';
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
import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/constants/lifi-cross-chain-supported-blockchain';
import { LifiCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-trade';
import { LifiBridgeTypes } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-bridge-types';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { lifiProviders } from 'src/features/on-chain/calculation-manager/providers/lifi/constants/lifi-providers';

export class LifiCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    private readonly lifi = new LIFI(getLifiConfig());

    private readonly MIN_AMOUNT_USD = new BigNumber(30);

    private readonly lifiFee = 0.0015;

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

        // await this.checkContractState(
        //     fromBlockchain,
        //     rubicProxyContractAddress[fromBlockchain],
        //     evmCommonCrossChainAbi
        // );

        if (
            options.lifiDisabledBridgeTypes?.length &&
            !this.checkBridgeTypes(options.lifiDisabledBridgeTypes)
        ) {
            throw new RubicSdkError('Incorrect bridges filter param');
        }

        const routeOptions: RouteOptions = {
            slippage: options.slippageTolerance,
            order: 'RECOMMENDED',
            allowSwitchChain: false,
            bridges: {
                deny: options.lifiDisabledBridgeTypes
            },
            fee: this.lifiFee,
            integrator: 'Rubic'
        };

        const fromChainId = blockchainId[fromBlockchain];
        const toChainId = blockchainId[toBlockchain];

        const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
        // const fromWithoutFee = getFromWithoutFee(from, feeInfo.rubicProxy?.platformFee?.percent);
        const fromWithoutFee = from;

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
            throw new RubicSdkError('No available routes');
        }

        // const providerGateway = bestRoute.steps[0]!.estimate.approvalAddress;
        // await this.checkProviderIsWhitelisted(from.blockchain, providerGateway);

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

        const { onChainType, bridgeType } = this.parseTradeTypes(bestRoute);

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
        const fromUsdAmount = from.price.multipliedBy(from.tokenAmount);
        if (fromUsdAmount.lt(this.MIN_AMOUNT_USD)) {
            if (from.price.isFinite()) {
                const minTokenAmount = this.MIN_AMOUNT_USD.multipliedBy(from.tokenAmount).dividedBy(
                    fromUsdAmount
                );
                throw new MinAmountError(minTokenAmount, from.symbol);
            }
            throw new MinAmountError(this.MIN_AMOUNT_USD, 'USDC');
        }
    }

    protected override async getFeeInfo(
        fromBlockchain: LifiCrossChainSupportedBlockchain,
        _providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    // amount: await this.getFixedFee(
                    //     fromBlockchain,
                    //     providerAddress,
                    //     rubicProxyContractAddress[fromBlockchain],
                    //     evmCommonCrossChainAbi
                    // ),
                    amount: new BigNumber(0),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    // percent: await this.getFeePercent(
                    //     fromBlockchain,
                    //     providerAddress,
                    //     rubicProxyContractAddress[fromBlockchain],
                    //     evmCommonCrossChainAbi
                    // ),
                    percent: 0,
                    tokenSymbol: percentFeeToken.symbol
                }
            },
            provider: {
                platformFee: {
                    percent: this.lifiFee * 100,
                    tokenSymbol: percentFeeToken.symbol
                }
            }
        };
    }

    // @todo move to evm-cross-chain-provider
    private async checkProviderIsWhitelisted(
        fromBlockchain: EvmBlockchainName,
        providerRouter: string,
        providerGateway?: string
    ): Promise<void> {
        const whitelistedContracts = await Injector.web3PublicService
            .getWeb3Public(fromBlockchain)
            .callContractMethod<string[]>(
                wlContractAddress[fromBlockchain],
                wlContractAbi,
                'getAvailableCrossChains'
            );

        if (
            !whitelistedContracts.find(whitelistedContract =>
                compareAddresses(whitelistedContract, providerRouter)
            ) ||
            (providerGateway &&
                !whitelistedContracts.find(whitelistedContract =>
                    compareAddresses(whitelistedContract, providerGateway)
                ))
        ) {
            throw new NotWhitelistedProviderError(providerRouter, providerGateway, 'crosschain');
        }
    }

    private parseTradeTypes(route: Route): {
        onChainType: { from: OnChainTradeType | undefined; to: OnChainTradeType | undefined };
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

        const onChainType = {
            from: sourceDex ? lifiProviders[sourceDex] : undefined,
            to: targetDex ? lifiProviders[targetDex] : undefined
        };
        const bridgeType = bridges.find(bridge => bridge.toLowerCase() === subType);

        return {
            onChainType,
            bridgeType
        };
    }

    private checkBridgeTypes(notAllowedBridgeTypes: LifiBridgeTypes[]): boolean {
        const lifiBridgeTypes = Object.values(LifiBridgeTypes);
        return notAllowedBridgeTypes.every(bridgeType => lifiBridgeTypes.includes(bridgeType));
    }
}
