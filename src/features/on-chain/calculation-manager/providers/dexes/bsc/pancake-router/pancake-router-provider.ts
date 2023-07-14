import { Native as PancakeNative, Token as PancakeToken } from '@pancakeswap/sdk';
import {
    OnChainProvider,
    Pool,
    SmartRouter,
    SubgraphProvider
} from '@pancakeswap/smart-router/evm';
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core';
import BigNumber from 'bignumber.js';
import { GraphQLClient } from 'graphql-request';
import { createPublicClient, http } from 'rubic-viem/dist';
import { bsc, mainnet } from 'rubic-viem/dist/chains';
import { PublicClient } from 'rubic-viem/dist/clients/createPublicClient';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { subgraphUrls } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-router/constants';
import { PancakeRouterTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-router/models/pancake-router-trade-struct';
import { PancakeRouterTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-router/pancake-router-trade';
import { PANCAKE_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-swap/constants';
import { PancakeSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-swap/pancake-swap-trade';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';

export class PancakeRouterProvider extends EvmOnChainProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly UniswapV2TradeClass = PancakeSwapTrade;

    public readonly providerSettings = PANCAKE_SWAP_PROVIDER_CONFIGURATION;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    protected readonly defaultOptions: UniswapV2CalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<EvmOnChainTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);
        const fromChainId = blockchainId[from.blockchain];
        const currencyA = from.isNative
            ? PancakeNative.onChain(fromChainId)
            : new PancakeToken(fromChainId, from.address, from.decimals, from.symbol, from.name);

        const toChainId = blockchainId[to.blockchain];
        const currencyB = to.isNative
            ? PancakeNative.onChain(toChainId)
            : new PancakeToken(toChainId, to.address, to.decimals, to.symbol, to.name);

        const fromCurrency = CurrencyAmount.fromRawAmount(currencyA, from.stringWeiAmount);

        // @ts-ignore
        const viemProviders = (({ chainId }) =>
            this.getViemProvider(chainId)) as unknown as OnChainProvider;
        const onChainQuoteProvider = SmartRouter.createQuoteProvider({
            onChainProvider: viemProviders
        });
        const pools = await this.getPools(currencyA, currencyB, viemProviders);

        const trade = await SmartRouter.getBestTrade(fromCurrency, currencyB, 0, {
            poolProvider: SmartRouter.createStaticPoolProvider(pools),
            quoteProvider: onChainQuoteProvider,
            maxHops: 2,
            maxSplits: 2,
            quoterOptimization: false,
            gasPriceWei: '1'
        });
        if (!trade) {
            throw new RubicSdkError('');
        }

        const toAmount = trade.outputAmount.toFixed();
        const toToken = new PriceTokenAmount({
            ...to.asStruct,
            tokenAmount: new BigNumber(toAmount)
        });

        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...from.asStruct,
                    weiAmount: from.weiAmount
                }),
                fullOptions
            );
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
        }

        const tradeStruct: PancakeRouterTradeStruct = {
            from,
            to: toToken,
            // exact,
            path: [],
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee: from,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            trade
        };

        return new PancakeRouterTrade(tradeStruct, fullOptions.providerAddress);
    }

    private async getPools(
        currencyA: Currency,
        currencyB: Currency,
        viemProviders: OnChainProvider
    ): Promise<Pool[]> {
        const pairs = SmartRouter.getPairCombinations(currencyA, currencyB);

        const blockchainName = BlockchainsInfo.getBlockchainNameById(
            currencyA.chainId
        ) as unknown as EvmBlockchainName;
        // @ts-ignore
        const v3SubgraphProvider: SubgraphProvider = () => {
            return new GraphQLClient(
                subgraphUrls[blockchainName] || subgraphUrls[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]!
            );
        };

        const allPools = await Promise.allSettled([
            SmartRouter.getV3PoolSubgraph({ provider: v3SubgraphProvider, pairs }).then(res =>
                SmartRouter.v3PoolSubgraphSelection(currencyA, currencyB, res)
            ),
            SmartRouter.getV2PoolsOnChain(pairs, viemProviders),
            SmartRouter.getStablePoolsOnChain(pairs, viemProviders)
        ]);

        const fulfilledPools = allPools.reduce((acc, pool) => {
            if (pool.status === 'fulfilled') {
                return [...acc, ...pool.value];
            }
            return acc;
        }, [] as Pool[]);

        return fulfilledPools.flat();
    }

    private getViemProvider(chainId: number): PublicClient {
        const mapping = {
            1: mainnet,
            56: bsc
        };

        const rpcList = Injector.web3PublicService.rpcProvider;
        const rpcMapping = {
            1: rpcList.ETH,
            56: rpcList.BSC
        };

        // @ts-ignore
        const chain = mapping?.[chainId];
        // @ts-ignore
        const rpc = rpcMapping?.[chainId];

        if (!chain || !rpc) {
            createPublicClient({
                chain: bsc,
                transport: http(rpcList.BSC!.rpcList[0] as unknown as string)
            });
        }

        // @ts-ignore
        return createPublicClient({ chain, transport: http(rpc!.rpcList[0]) });
    }
}
