import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { SyncSwapAbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/sync-swap-abstract-trade';
import { SyncSwapFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/utils/sync-swap-factory';
import { SyncSwapPathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/utils/sync-swap-path-factory';
import { SyncSwapRouter } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/utils/sync-swap-router';
import { RoutePools } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/utils/typings';

export abstract class SyncSwapAbstractProvider extends EvmOnChainProvider {
    public abstract blockchain: EvmBlockchainName;

    protected abstract dexContractAddress: string;

    protected abstract routerHelperContract: string;

    protected abstract vault: string;

    protected abstract factories: string[];

    protected abstract routeTokens: string[];

    protected abstract masterAddress: string;

    protected abstract maxTransitTokens: number;

    private readonly defaultOptions = evmProviderDefaultOptions;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SYNC_SWAP;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<SyncSwapAbstractTrade> {
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

        const availablePools = await this.getAvailablePools(fromProxy, toProxy);
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
            fromWithoutFee.stringWeiAmount,
            this.blockchain
        );

        const sortedPaths = filteredPaths.filter(item => item.length <= this.maxTransitTokens + 1);

        const bestRoute = await SyncSwapRouter.findBestAmountsForPathsExactIn(
            sortedPaths,
            fromWithoutFee.stringWeiAmount,
            this.blockchain
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

        try {
            const gasPriceInfo = await this.getGasPriceInfo();
            const gasLimit = await SyncSwapAbstractTrade.getGasLimit(
                tradeStruct,
                this.dexContractAddress,
                fullOptions.providerAddress
            );
            const gasFeeInfo = getGasFeeInfo(gasPriceInfo, {
                ...(gasLimit && { gasLimit })
            });

            return new SyncSwapAbstractTrade(
                { ...tradeStruct, gasFeeInfo },
                fullOptions.providerAddress,
                this.dexContractAddress
            );
        } catch {
            return new SyncSwapAbstractTrade(
                tradeStruct,
                fullOptions.providerAddress,
                this.dexContractAddress
            );
        }
    }

    private async getAvailablePools(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<RoutePools | null> {
        return SyncSwapFactory.fetchRoutePools(
            from.address,
            toToken.address,
            this.walletAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            this.vault,
            this.factories.map(address => address.toLowerCase()),
            this.routeTokens.map(address => address.toLowerCase()),
            this.masterAddress,
            this.routerHelperContract,
            this.blockchain
        );
    }
}
