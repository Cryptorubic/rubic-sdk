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

export class LifiCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is LifiCrossChainSupportedBlockchain {
        return lifiCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    private readonly lifi = new LIFI();

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = to.blockchain;
        if (
            !LifiCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !LifiCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        const feePercent = await this.getFeePercent(fromBlockchain);
        const tokenAmountIn = from.weiAmount.multipliedBy(1 - feePercent).toFixed(0, 1);

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
            toTokenAddress: to.address,
            options: routeOptions
        };

        const result = await this.lifi.getRoutes(routesRequest);
        const { routes } = result;

        const bestRoute = routes[0];

        if (!bestRoute) {
            return null;
        }

        return {
            trade: new LifiCrossChainTrade(
                {
                    from: new PriceTokenAmount({
                        ...from.asStructWithAmount,
                        price: new BigNumber(bestRoute.fromAmountUSD)
                    }),
                    to: new PriceTokenAmount({
                        ...to.asStruct,
                        weiAmount: new BigNumber(bestRoute.toAmount)
                    }),
                    route: bestRoute,
                    gasData: null,
                    toTokenAmountMin: Web3Pure.fromWei(bestRoute.toAmountMin, to.decimals)
                },
                options.providerAddress
            )
        };
    }

    private async getFeePercent(fromBlockchain: BlockchainName): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        return (
            (await web3PublicService.callContractMethod<number>(
                lifiContractAddress,
                lifiContractAbi,
                'RubicFee'
            )) / 1_000_000
        );
    }
}
