import { Native as PancakeNative, Token as PancakeToken, TradeType } from '@pancakeswap/sdk';
import { Pool, SmartRouter } from '@pancakeswap/smart-router/evm';
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core';
import BigNumber from 'bignumber.js';
import { GraphQLClient } from 'graphql-request';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { PancakeRouterTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/pancake-router/models/pancake-router-trade-struct';
import { PancakeRouterTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/pancake-router/pancake-router-trade';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { Chain, createPublicClient, http, PublicClient } from 'viem';

export abstract class PancakeRouterProvider extends EvmOnChainProvider {
    public abstract readonly blockchain: EvmBlockchainName;

    protected abstract readonly chain: Chain;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    protected readonly defaultOptions: UniswapV2CalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    protected abstract readonly dexAddress: string;

    protected abstract readonly v3subgraphAddress: string;

    protected abstract readonly v2subgraphAddress: string;

    protected abstract readonly maxHops: number;

    protected abstract readonly maxSplits: number;

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<EvmOnChainTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        let weiAmountWithoutFee = from.stringWeiAmount;

        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...from.asStruct,
                    weiAmount: from.weiAmount
                }),
                fullOptions
            );
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
            weiAmountWithoutFee = proxyContractInfo.fromWithoutFee.stringWeiAmount;
        }

        const fromChainId = blockchainId[from.blockchain];
        const currencyA = from.isNative
            ? PancakeNative.onChain(fromChainId)
            : new PancakeToken(
                  fromChainId,
                  from.address as `0x${string}`,
                  from.decimals,
                  from.symbol,
                  from.name
              );

        const toChainId = blockchainId[to.blockchain];
        const currencyB = to.isNative
            ? PancakeNative.onChain(toChainId)
            : new PancakeToken(
                  toChainId,
                  to.address as `0x${string}`,
                  to.decimals,
                  to.symbol,
                  to.name
              );

        const fromCurrency = CurrencyAmount.fromRawAmount(currencyA, weiAmountWithoutFee);
        const quoteProvider = SmartRouter.createQuoteProvider({
            // @ts-ignore
            onChainProvider: () => this.createPublicClient()
        });
        const pools = await this.getPools(currencyA, currencyB);

        const trade = await SmartRouter.getBestTrade(
            fromCurrency,
            currencyB,
            TradeType.EXACT_INPUT,
            {
                gasPriceWei: () => this.createPublicClient().getGasPrice(),
                maxHops: this.maxHops,
                maxSplits: this.maxSplits,
                poolProvider: SmartRouter.createStaticPoolProvider(pools),
                quoteProvider,
                quoterOptimization: true
            }
        );
        if (!trade) {
            throw new RubicSdkError('');
        }

        const toAmount = trade.outputAmount.toFixed();
        const toToken = new PriceTokenAmount({
            ...to.asStruct,
            tokenAmount: new BigNumber(toAmount)
        });

        //@ts-ignore
        const path = await this.getPath(from, to, trade.routes?.[0]?.path || []);
        const tradeStruct: PancakeRouterTradeStruct = {
            from,
            to: toToken,
            path,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee: from,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            trade,
            dexContractAddress: this.dexAddress
        };
        if (options?.gasCalculation === 'calculate') {
            try {
                const gasPriceInfo = await this.getGasPriceInfo();
                const gasLimit = await PancakeRouterTrade.getGasLimit(
                    tradeStruct,
                    fullOptions.providerAddress
                );
                tradeStruct.gasFeeInfo = getGasFeeInfo(gasPriceInfo, {
                    ...(gasLimit && { gasLimit })
                });
            } catch {}
        }

        return new PancakeRouterTrade(tradeStruct, fullOptions.providerAddress);
    }

    private async getPools(currencyA: Currency, currencyB: Currency): Promise<Pool[]> {
        const v3SubgraphClient = new GraphQLClient(this.v3subgraphAddress);
        const v2SubgraphClient = new GraphQLClient(this.v2subgraphAddress);

        const pairs = SmartRouter.getPairCombinations(currencyA, currencyB);

        const allPools = await Promise.allSettled([
            // // @ts-ignore
            SmartRouter.getStablePoolsOnChain(pairs, () => this.createPublicClient()),
            SmartRouter.getV2CandidatePools({
                // @ts-ignore
                onChainProvider: () => this.createPublicClient(),
                // @ts-ignore
                v2SubgraphProvider: () => v2SubgraphClient,
                // @ts-ignore
                v3SubgraphProvider: () => v3SubgraphClient,
                currencyA,
                currencyB
            }),
            SmartRouter.getV3CandidatePools({
                // @ts-ignore
                onChainProvider: () => this.createPublicClient(),
                // @ts-ignore
                subgraphProvider: () => v3SubgraphClient,
                currencyA,
                currencyB,
                subgraphCacheFallback: false
            })
        ]);

        const fulfilledPools = allPools.reduce((acc, pool) => {
            if (pool.status === 'fulfilled') {
                return [...acc, ...pool.value];
            }
            return acc;
        }, [] as Pool[]);

        return fulfilledPools.flat();
    }

    private createPublicClient(): PublicClient {
        const transportUrl = Injector.web3PublicService.rpcProvider[this.blockchain]?.rpcList[0]!;

        if (this.blockchain === BLOCKCHAIN_NAME.POLYGON_ZKEVM) {
            return createPublicClient({
                chain: {
                    ...this.chain,
                    contracts: {
                        multicall3: {
                            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
                            blockCreated: 57746
                        }
                    }
                },
                transport: http(transportUrl),
                batch: {
                    multicall: {
                        batchSize: 512
                    }
                }
            });
        }

        return createPublicClient({
            chain: this.chain,
            transport: http(transportUrl),
            batch: {
                multicall: {
                    batchSize: 1024 * 200
                }
            }
        });
    }

    private async getPath(fromToken: Token, toToken: Token, route: Currency[]): Promise<Token[]> {
        const path = [fromToken];
        if (route.length > 2) {
            const addresses = route
                .slice(1, -1)
                .map(token => ('address' in token && token.address) || EvmWeb3Pure.EMPTY_ADDRESS);
            const tokens = await Token.createTokens(addresses, fromToken.blockchain);
            path.push(...tokens);
        }
        path.push(toToken);
        return path;
    }
}
