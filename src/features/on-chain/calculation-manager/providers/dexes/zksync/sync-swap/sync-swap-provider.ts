import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token, wrappedNativeTokensList } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { SyncSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/sync-swap-trade';
import { SyncSwapFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/sync-swap-factory';
import { SyncSwapPathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/sync-swap-path-factory';
import { SyncSwapRouter } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/sync-swap-router';
import { RoutePools } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/typings';

export class SyncSwapProvider extends EvmOnChainProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_SYNC;

    private readonly defaultOptions = evmProviderDefaultOptions;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SYNC_SWAP;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<SyncSwapTrade> {
        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.walletAddress;
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress
        });
        const fromProxy = createTokenNativeAddressProxy(
            from,
            wrappedNativeTokensList[from.blockchain]!.address
        );
        const toProxy = createTokenNativeAddressProxy(
            toToken,
            wrappedNativeTokensList[from.blockchain]!.address
        );
        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(
            fromProxy,
            fullOptions
        );

        const availablePools = await this.getAvailablePools(fromWithoutFee, toProxy);
        if (!availablePools) {
            throw new NotSupportedTokensError();
        }

        const paths = SyncSwapPathFactory.findAllPossiblePaths(
            fromProxy.address,
            toProxy.address,
            availablePools
        );

        const filteredPaths = await SyncSwapPathFactory.getBestPath(
            paths,
            fromWithoutFee.stringWeiAmount
        );

        const bestRoute = await SyncSwapRouter.findBestAmountsForPathsExactIn(
            filteredPaths,
            fromWithoutFee.stringWeiAmount
        );

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(bestRoute.amountOut.toString())
        });

        const transitAddresses = bestRoute.pathsWithAmounts[0]!.stepsWithAmount.slice(1).map(
            step => step.tokenIn
        );
        const transitTokens = await Token.createTokens(transitAddresses, from.blockchain);

        const tradeStruct = {
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            path: [from, ...transitTokens, toToken],
            bestPathWithAmounts: bestRoute
        };

        return new SyncSwapTrade(tradeStruct, fullOptions.providerAddress);
    }

    private async getAvailablePools(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<RoutePools | null> {
        return SyncSwapFactory.fetchRoutePools(
            from.address,
            toToken.address,
            this.walletAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            '0x621425a1Ef6abE91058E9712575dcc4258F8d091',
            [
                '0xf2dad89f2788a8cd54625c60b55cd3d2d0aca7cb', // Stable
                '0x5b9f21d407f35b10cbfddca17d5d84b129356ea3' // Regular
            ],
            [
                '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91', // WETH
                '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4' // USDC
            ].map(address => address.toLowerCase()),
            '0xbb05918e9b4ba9fe2c8384d223f0844867909ffb'
        );
    }
}
