import { CROSS_CHAIN_TRADE_TYPE } from 'src/features';
import { BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import BigNumber from 'bignumber.js';
import {
    LifiCrossChainSupportedBlockchain,
    lifiCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import LIFI, { RouteOptions } from '@lifinance/sdk';
import { LifiCrossChainTrade } from 'src/features/cross-chain/providers/lifi-trade-provider/lifi-cross-chain-trade';
import { Injector } from 'src/core/sdk/injector';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import {
    lifiContractAbi,
    lifiContractAddress
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-contract-data';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { getLifiConfig } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-config';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { CrossChainIsUnavailableError } from 'src/common';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';

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

        const feePercent = await this.getFeePercent(fromBlockchain, options.providerAddress);
        const fromAmountWithoutFee = from.tokenAmount.multipliedBy(100 - feePercent).dividedBy(100);
        const tokenAmountIn = Web3Pure.toWei(fromAmountWithoutFee, from.decimals, 1);

        const networkFee = await this.getNetworkFee(fromBlockchain);
        const networkFeeSymbol = nativeTokensList[fromBlockchain].symbol;

        const routeOptions: RouteOptions = {
            slippage: options.slippageTolerance,
            order: 'RECOMMENDED',
            allowSwitchChain: false,
            bridges: {
                deny: ['multichain'] // @TODO remove after whitelisting
            }
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

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(bestRoute.toAmount)
        });
        const gasData =
            options.gasCalculation === 'enabled'
                ? await LifiCrossChainTrade.getGasData(from, to, bestRoute)
                : null;

        return {
            trade: new LifiCrossChainTrade(
                {
                    from: new PriceTokenAmount({
                        ...from.asStructWithAmount,
                        price: new BigNumber(bestRoute.fromAmountUSD)
                    }),
                    to,
                    route: bestRoute,
                    gasData,
                    toTokenAmountMin: Web3Pure.fromWei(bestRoute.toAmountMin, to.decimals),
                    fee: from.tokenAmount.minus(fromAmountWithoutFee),
                    feeSymbol: from.symbol,
                    feePercent,
                    networkFee,
                    networkFeeSymbol,
                    priceImpact
                },
                options.providerAddress
            )
        };
    }

    private async getFeePercent(
        fromBlockchain: LifiCrossChainSupportedBlockchain,
        providerAddress: string
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (providerAddress !== EMPTY_ADDRESS) {
            return (
                (await web3PublicService.callContractMethod<number>(
                    lifiContractAddress[fromBlockchain],
                    lifiContractAbi,
                    'integratorFee',
                    {
                        methodArguments: [providerAddress]
                    }
                )) / 10_000
            );
        }

        return (
            (await web3PublicService.callContractMethod<number>(
                lifiContractAddress[fromBlockchain],
                lifiContractAbi,
                'RubicPlatformFee'
            )) / 10_000
        );
    }

    private async getNetworkFee(
        fromBlockchain: LifiCrossChainSupportedBlockchain
    ): Promise<BigNumber> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const weiAmount = await web3PublicService.callContractMethod(
            lifiContractAddress[fromBlockchain],
            lifiContractAbi,
            'fixedCryptoFee'
        );

        return Web3Pure.fromWei(weiAmount);
    }

    private async checkContractState(fromBlockchain: LifiCrossChainSupportedBlockchain) {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<number>(
            lifiContractAddress[fromBlockchain],
            lifiContractAbi,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
