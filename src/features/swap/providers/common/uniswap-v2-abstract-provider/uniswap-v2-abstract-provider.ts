import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { GasInfo } from '@features/swap/models/gas-info';
import { GasCalculationMethod } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/gas-calculation-method';
import { UniswapV2AbstractTrade } from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import UNISWAP_V2_ABI from 'src/features/swap/providers/common/uniswap-v2/constants/uniswap-v2-abi';
import { Web3Public } from 'src/core/blockchain/web3-public/web3-public';
import { defaultEstimatedGas } from 'src/features/swap/providers/common/uniswap-v2/constants/default-estimated-gas';
import { SWAP_METHOD } from 'src/features/swap/providers/common/uniswap-v2/constants/SWAP_METHOD';
import { SwapOptions } from 'src/features/swap/models/swap-options';
import { Uniswapv2InstantTrade } from '@features/swap/trades/instant-trade';
import {
    UniswapCalculatedInfo,
    UniswapCalculatedInfoWithProfit
} from 'src/features/swap/providers/common/uniswap-v2/models/uniswap-calculated-info';
import { UniswapRoute } from 'src/features/swap/providers/common/uniswap-v2/models/uniswap-route';
import { CreateTradeMethod } from 'src/features/swap/providers/common/uniswap-v2/models/create-trade-method';
import { InternalUniswapV2Trade } from 'src/features/swap/providers/common/uniswap-v2/models/uniswap-v2-trade';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity-error';
import { SwapTransactionOptionsWithGasLimit } from 'src/features/swap/models/swap-transaction-options';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';

export abstract class UniswapV2AbstractProvider {
    protected abstract wethAddress: string;

    protected abstract contractAddress: string;

    protected abstract routingProviders: string[];

    protected abstract maxTransitTokens: number;

    protected readonly contractAbi = UNISWAP_V2_ABI;

    private readonly defaultEstimateGas = defaultEstimatedGas;

    private readonly GAS_MARGIN = 1.2;

    private readonly web3Private = Injector.web3Private;

    private readonly web3PublicService = Injector.web3PublicService;

    private readonly coingeckoApi = Injector.coingeckoApi;

    private get walletAddress(): string | undefined {
        return this.web3Private.address;
    }

    protected constructor() {}

    private calculateTokensToTokensGasLimit: GasCalculationMethod = (
        trade: InternalUniswapV2Trade
    ) => {
        return {
            callData: {
                contractMethod: SWAP_METHOD[trade.exact].TOKENS_TO_TOKENS,
                params: [trade.amountIn, trade.amountOut, trade.path, trade.to, trade.deadline]
            },
            defaultGasLimit: this.defaultEstimateGas.tokensToTokens[trade.path.length - 2]
        };
    };

    private calculateEthToTokensGasLimit: GasCalculationMethod = (
        trade: InternalUniswapV2Trade
    ) => {
        return {
            callData: {
                contractMethod: SWAP_METHOD[trade.exact].ETH_TO_TOKENS,
                params: [trade.amountIn, trade.path, trade.to, trade.deadline],
                value: trade.amountOut
            },
            defaultGasLimit: this.defaultEstimateGas.ethToTokens[trade.path.length - 2]
        };
    };

    private calculateTokensToEthGasLimit: GasCalculationMethod = (
        trade: InternalUniswapV2Trade
    ) => {
        return {
            callData: {
                contractMethod: SWAP_METHOD[trade.exact].TOKENS_TO_ETH,
                params: [trade.amountIn, trade.amountOut, trade.path, trade.to, trade.deadline]
            },
            defaultGasLimit: this.defaultEstimateGas.tokensToEth[trade.path.length - 2]
        };
    };

    private createEthToTokensTrade: CreateTradeMethod = (
        trade: InternalUniswapV2Trade,
        options: SwapTransactionOptionsWithGasLimit
    ) => {
        return this.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.contractAbi,
            SWAP_METHOD[trade.exact].ETH_TO_TOKENS,
            [trade.amountOut, trade.path, trade.to, trade.deadline],
            {
                onTransactionHash: options.onConfirm,
                value: trade.amountIn,
                gas: options.gasLimit,
                ...(options.gasPrice && { gasPrice: options.gasPrice })
            }
        );
    };

    private createTokensToEthTrade: CreateTradeMethod = (
        trade: InternalUniswapV2Trade,
        options: SwapTransactionOptionsWithGasLimit
    ) => {
        return this.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.contractAbi,
            SWAP_METHOD[trade.exact].TOKENS_TO_ETH,
            [trade.amountIn, trade.amountOut, trade.path, trade.to, trade.deadline],
            {
                onTransactionHash: options.onConfirm,
                gas: options.gasLimit,
                ...(options.gasPrice && { gasPrice: options.gasPrice })
            }
        );
    };

    private createTokensToTokensTrade: CreateTradeMethod = (
        trade: InternalUniswapV2Trade,
        options: SwapTransactionOptionsWithGasLimit
    ) => {
        return this.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.contractAbi,
            SWAP_METHOD[trade.exact].TOKENS_TO_TOKENS,
            [trade.amountIn, trade.amountOut, trade.path, trade.to, trade.deadline],
            {
                onTransactionHash: options.onConfirm,
                gas: options.gasLimit,
                ...(options.gasPrice && { gasPrice: options.gasPrice })
            }
        );
    };

    private createTokenWETHAbleProxy<T extends Token>(token: T): T {
        const wethAbleAddress = token.isNative ? this.wethAddress : token.address;
        return new Proxy<T>(token, {
            get: (target, key) => {
                if (!(key in target)) {
                    return undefined;
                }
                if (key === 'address') {
                    return wethAbleAddress;
                }
                return target[key as keyof T];
            }
        });
    }

    private async getGasInfo(blockchain: BLOCKCHAIN_NAME): Promise<GasInfo> {
        const gasPrice = await this.web3PublicService.getWeb3Public(blockchain).getGasPrice();
        const gasPriceInEth = Web3Pure.fromWei(gasPrice);
        const nativeCoinPrice = await this.coingeckoApi.getNativeCoinPrice(blockchain);
        const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
        return {
            gasPrice: new BigNumber(gasPrice),
            gasPriceInEth,
            gasPriceInUsd
        };
    }

    public async calculateTrade(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        exact: 'input' | 'output',
        options: SwapOptions = {
            gasCalculation: 'calculate',
            disableMultihops: false,
            deadline: 1200000, // 20 min
            slippageTolerance: 0.05
        }
    ): Promise<UniswapV2AbstractTrade> {
        const fromProxy = this.createTokenWETHAbleProxy(from);
        const toProxy = this.createTokenWETHAbleProxy(to);

        let gasInfo: Partial<GasInfo> = {};
        if (options.gasCalculation !== 'disabled') {
            gasInfo = await this.getGasInfo(from.blockchain);
        }

        const { route, estimatedGas } = await this.getAmountAndPath(fromProxy, toProxy, exact, {
            ...options,
            gasCalculationMethodName,
            gasPriceInUsd
        });

        const instantTrade: Uniswapv2InstantTrade = {
            from: {
                token: fromToken,
                amount: fromAmount
            },
            to: {
                token: toToken,
                amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
            },
            gasInfo: {
                gasLimit: null,
                gasPrice: null,
                gasFeeInEth: null,
                gasFeeInUsd: null
            },
            path: route.path,
            deadline: options.deadline,
            slippageTolerance: options.slippageTolerance,
            exact
        };

        if (!options.shouldCalculateGas) {
            return instantTrade;
        }

        const gasLimit = estimatedGas
            ? Web3Public.calculateGasMargin(estimatedGas, this.GAS_MARGIN)
            : null;
        const gasFeeInEth = gasPriceInEth && gasLimit ? gasPriceInEth.multipliedBy(gasLimit) : null;
        const gasFeeInUsd =
            gasPriceInEth && gasLimit ? gasPriceInUsd?.multipliedBy(gasLimit) : null;

        return {
            ...instantTrade,
            gasInfo: {
                gasLimit,
                gasPrice: gasPrice || null,
                gasFeeInUsd: gasFeeInUsd || null,
                gasFeeInEth
            }
        };
    }

    private async getAmountAndPath(
        from: PriceTokenAmount,
        to: Token,
        exact: 'input' | 'output',
        gasPriceInUsd: BigNumber | undefined,
        options: SwapOptions
    ): Promise<UniswapCalculatedInfo> {
        const routes = (
            await this.getAllRoutes(
                from.address,
                to.address,
                from.stringWeiAmount,
                options.disableMultihops ? 0 : this.maxTransitTokens,
                exact === 'output' ? 'getAmountsOut' : 'getAmountsIn'
            )
        ).sort((a, b) => (b.outputAbsoluteAmount.gt(a.outputAbsoluteAmount) ? 1 : -1));
        if (routes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (options.gasCalculation === 'disabled') {
            return {
                route: routes[0]
            };
        }

        const deadline = Math.floor(Date.now() / 1000) + 60 * options.deadline;
        const slippage = new BigNumber(1).minus(options.slippageTolerance);

        const gasRequests = routes.map(route => {
            let amountIn = amountAbsolute;
            let amountOut = route.outputAbsoluteAmount.multipliedBy(slippage).toFixed(0);
            if (exact === 'input') {
                [amountIn, amountOut] = [amountOut, amountIn];
            }
            return options.gasCalculationMethodName({
                amountIn,
                amountOut,
                path: route.path,
                deadline,
                to: this.walletAddress,
                exact
            });
        });

        const gasLimits = gasRequests.map(item => item.defaultGasLimit);

        if (this.walletAddress) {
            const estimatedGasLimits = await this.web3Public.batchEstimatedGas(
                UNISWAP_V2_ABI,
                this.contractAddress,
                this.walletAddress,
                gasRequests.map(item => item.callData)
            );
            estimatedGasLimits.forEach((elem, index) => {
                if (elem && !elem.isNaN()) {
                    gasLimits[index] = elem;
                }
            });
        }

        if (
            options.rubicOptimisation &&
            toToken.price &&
            options.gasPriceInUsd &&
            this.walletAddress
        ) {
            const routesWithProfit: UniswapCalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const estimatedGas = gasLimits[index];
                    const gasFeeInUsd = estimatedGas.multipliedBy(options.gasPriceInUsd!!);
                    const profit = Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
                        .multipliedBy(toToken.price!!)
                        .multipliedBy(exact === 'output' ? 1 : -1)
                        .minus(gasFeeInUsd);

                    return {
                        route,
                        estimatedGas,
                        profit
                    };
                }
            );

            const sortedByProfitRoutes = routesWithProfit.sort((a, b) =>
                b.profit.minus(a.profit).gt(0) ? 1 : -1
            );

            return sortedByProfitRoutes[0];
        }

        return {
            route: routes[0],
            estimatedGas: gasLimits[0]
        };
    }

    private async getAllRoutes(
        fromTokenAddress: string,
        toTokenAddress: string,
        amountAbsolute: string,
        maxTransitTokens: number,
        uniswapMethodName: 'getAmountsOut' | 'getAmountsIn'
    ): Promise<UniswapRoute[]> {
        const vertexes: string[] = this.routingProviders
            .map(elem => elem.toLowerCase())
            .filter(
                elem =>
                    elem !== toTokenAddress.toLowerCase() && elem !== fromTokenAddress.toLowerCase()
            );
        const initialPath = [fromTokenAddress];
        const routesPaths: string[][] = [];
        const routesMethodArguments: [string, string[]][] = [];

        const recGraphVisitor = (path: string[], mxTransitTokens: number): void => {
            if (path.length === mxTransitTokens + 1) {
                const finalPath = path.concat(toTokenAddress);
                routesPaths.push(finalPath);
                routesMethodArguments.push([amountAbsolute, finalPath]);
                return;
            }

            vertexes
                .filter(vertex => !path.includes(vertex))
                .forEach(vertex => {
                    const extendedPath = path.concat(vertex);
                    recGraphVisitor(extendedPath, mxTransitTokens);
                });
        };

        for (let i = 0; i <= maxTransitTokens; i++) {
            recGraphVisitor(initialPath, i);
        }

        const routes: UniswapRoute[] = [];
        await this.web3Public
            .multicallContractMethod<{ amounts: string[] }>(
                this.contractAddress,
                this.contractAbi,
                uniswapMethodName,
                routesMethodArguments
            )
            .then(responses => {
                responses.forEach((response, index) => {
                    if (!response.success || !response.output) {
                        return;
                    }
                    const { amounts } = response.output;
                    const amount = new BigNumber(
                        uniswapMethodName === 'getAmountsOut'
                            ? amounts[amounts.length - 1]
                            : amounts[0]
                    );
                    const path = routesPaths[index];
                    routes.push({
                        outputAbsoluteAmount: amount,
                        path
                    });
                });
            })
            .catch(err => {
                console.debug(err);
            });

        return routes;
    }

    public async getFromAmount(
        fromToken: Token,
        toToken: Token,
        toAmount: BigNumber
    ): Promise<BigNumber> {
        const fromTokenAddress = Web3Pure.isNativeAddress(fromToken.address)
            ? this.wethAddress
            : fromToken.address;
        const toTokenAddress = Web3Pure.isNativeAddress(toToken.address)
            ? this.wethAddress
            : toToken.address;

        const toAmountAbsolute = Web3Pure.toWei(toAmount, toToken.decimals);

        const routes = (
            await this.getAllRoutes(
                fromTokenAddress,
                toTokenAddress,
                toAmountAbsolute,
                this.maxTransitTokens,
                'getAmountsIn'
            )
        ).sort((a, b) => a.outputAbsoluteAmount.comparedTo(b.outputAbsoluteAmount));
        return routes[0]?.outputAbsoluteAmount;
    }
}
