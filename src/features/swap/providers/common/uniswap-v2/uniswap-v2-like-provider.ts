import BigNumber from 'bignumber.js';
import { from, Observable, of } from 'rxjs';
import UNISWAP_V2_ABI from 'src/features/swap/providers/common/uniswap-v2/constants/uniswap-v2-abi';
import { Web3Public } from 'src/core/blockchain/web3-public/web3-public';
import { Web3Private } from 'src/core/blockchain/web3-private/web3-private';
import { TransactionOptions } from 'src/core/blockchain/models/transaction-options';
import { defaultEstimatedGas } from 'src/features/swap/providers/common/uniswap-v2/constants/default-estimated-gas';
import { GasCalculationMethod } from 'src/features/swap/providers/common/uniswap-v2/models/gas-calculation-method';
import { SWAP_METHOD } from 'src/features/swap/providers/common/uniswap-v2/constants/SWAP_METHOD';
import { Token } from 'src/core/blockchain/models/token';
import { SwapOptions } from 'src/features/swap/models/swap-options';
import { Uniswapv2InstantTrade } from 'src/features/swap/models/instant-trade';
import {
    UniswapCalculatedInfo,
    UniswapCalculatedInfoWithProfit
} from 'src/features/swap/providers/common/uniswap-v2/models/uniswap-calculated-info';
import { UniswapRoute } from 'src/features/swap/providers/common/uniswap-v2/models/uniswap-route';
import { CreateTradeMethod } from 'src/features/swap/providers/common/uniswap-v2/models/create-trade-method';
import { InternalUniswapV2Trade } from 'src/features/swap/providers/common/uniswap-v2/models/uniswap-v2-trade';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity-error';
import { SwapTransactionOptionsWithGasLimit } from 'src/features/swap/models/swap-transaction-options';

export abstract class UniswapV2LikeProvider {
    protected abstract wethAddress: string;

    protected abstract contractAddress: string;

    protected abstract routingProviders: string[];

    protected abstract maxTransitTokens: number;

    private readonly abi = UNISWAP_V2_ABI;

    private readonly defaultEstimateGas = defaultEstimatedGas;

    private readonly GAS_MARGIN = 1.2;

    private get walletAddress(): string {
        return this.web3Private.address;
    }

    constructor(
        private readonly web3Public: Web3Public,
        private readonly web3Private: Web3Private
    ) {}

    public needApprove(tokenAddress: string, contractAddress: string): Observable<BigNumber> {
        if (Web3Public.isNativeAddress(tokenAddress)) {
            return of(new BigNumber(Infinity));
        }
        return from(
            this.web3Public.getAllowance(tokenAddress, this.walletAddress, contractAddress)
        );
    }

    public async approve(
        tokenAddress: string,
        contractAddress: string,
        options: TransactionOptions
    ): Promise<void> {
        await this.web3Private.approveTokens(tokenAddress, contractAddress, 'infinity', options);
    }

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
            this.abi,
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
            this.abi,
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
            this.abi,
            SWAP_METHOD[trade.exact].TOKENS_TO_TOKENS,
            [trade.amountIn, trade.amountOut, trade.path, trade.to, trade.deadline],
            {
                onTransactionHash: options.onConfirm,
                gas: options.gasLimit,
                ...(options.gasPrice && { gasPrice: options.gasPrice })
            }
        );
    };

    public async calculateTrade(
        fromToken: Token,
        fromAmount: BigNumber,
        toToken: Token,
        exact: 'input' | 'output',
        options: SwapOptions = {
            shouldCalculateGas: true,
            rubicOptimisation: true,
            disableMultihops: false,
            deadline: 1200000, // 20 min
            slippageTolerance: 0.05
        }
    ): Promise<Uniswapv2InstantTrade> {
        const { blockchain } = fromToken;
        let fromTokenAddress = fromToken.address;
        const toTokenClone = { ...toToken };

        let gasCalculationMethodName = this.calculateTokensToTokensGasLimit;

        if (Web3Public.isNativeAddress(fromTokenAddress)) {
            fromTokenAddress = this.wethAddress;
            gasCalculationMethodName = this.calculateEthToTokensGasLimit;
        }
        if (Web3Public.isNativeAddress(toTokenClone.address)) {
            toTokenClone.address = this.wethAddress;
            gasCalculationMethodName = this.calculateTokensToEthGasLimit;
        }

        const fromAmountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);

        let gasPrice;
        let gasPriceInEth: BigNumber | undefined;
        let gasPriceInUsd: BigNumber | undefined;
        if (options.shouldCalculateGas) {
            gasPrice = await this.web3Public.getGasPrice();
            gasPriceInEth = Web3Public.fromWei(gasPrice);
            const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(blockchain);
            gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromTokenAddress,
            toTokenClone,
            fromAmountAbsolute,
            exact,
            {
                ...options,
                gasCalculationMethodName,
                gasPriceInUsd
            }
        );

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
        fromTokenAddress: string,
        toToken: Token,
        amountAbsolute: string,
        exact: 'input' | 'output',
        options: SwapOptions & {
            gasCalculationMethodName: GasCalculationMethod;
            gasPriceInUsd?: BigNumber;
        }
    ): Promise<UniswapCalculatedInfo> {
        const routes = (
            await this.getAllRoutes(
                fromTokenAddress,
                toToken.address,
                amountAbsolute,
                this.routingProviders,
                options.disableMultihops ? 0 : this.maxTransitTokens,
                this.contractAddress,
                this.web3Public,
                exact === 'output' ? 'getAmountsOut' : 'getAmountsIn'
            )
        ).sort((a, b) => (b.outputAbsoluteAmount.gt(a.outputAbsoluteAmount) ? 1 : -1));
        if (routes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (!options.shouldCalculateGas) {
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
        routingProviders: string[],
        maxTransitTokens: number,
        contractAddress: string,
        web3Public: Web3Public,
        uniswapMethodName: 'getAmountsOut' | 'getAmountsIn'
    ): Promise<UniswapRoute[]> {
        const vertexes: string[] = routingProviders
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
        await web3Public
            .multicallContractMethod<{ amounts: string[] }>(
                contractAddress,
                this.abi,
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
}
