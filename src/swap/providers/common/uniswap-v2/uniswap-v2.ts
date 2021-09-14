import BigNumber from 'bignumber.js';
import { from, Observable, of } from 'rxjs';
import UNISWAP_V2_ABI from './constants/uniswap-v2-abi';
import { Web3Public } from '../../../../blockchain/web3-public/web3-public';
import { Web3Private } from '../../../../blockchain/web3-private/web3-private';
import { TransactionOptions } from '../../../../blockchain/models/transaction-options';
import { defaultEstimatedGas } from './constants/default-estimated-gas';
import { GasCalculationMethod } from './models/gas-calculation-method';
import { SWAP_METHOD } from './constants/SWAP_METHOD';
import { Token } from '../../../../blockchain/models/token';
import { SwapOptions } from '../../../models/swap-options';
import { InstantTrade } from '../../../models/instant-trade';
import {
    UniswapCalculatedInfo,
    UniswapCalculatedInfoWithProfit
} from './models/uniswap-calculated-info';
import { UniswapRoute } from './models/uniswap-route';
import { CreateTradeResponse } from './models/create-trade-response';
import { UniswapV2Trade } from './models/uniswap-v2-trade';
import { SwapCallbacks } from '../../../models/swap-callbacks';
import { InsufficientLiquidityError } from '../../../../common/errors/swap/insufficient-liquidity-error';

export abstract class UniswapV2 {
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
        amountIn: string,
        amountOutMin: string,
        path: string[],
        deadline: number
    ) => {
        return {
            callData: {
                contractMethod: SWAP_METHOD.TOKENS_TO_TOKENS,
                params: [amountIn, amountOutMin, path, this.walletAddress, deadline]
            },
            defaultGasLimit: this.defaultEstimateGas.tokensToTokens[path.length - 2]
        };
    };

    private calculateEthToTokensGasLimit: GasCalculationMethod = (
        amountIn: string,
        amountOutMin: string,
        path: string[],
        deadline: number
    ) => {
        return {
            callData: {
                contractMethod: SWAP_METHOD.ETH_TO_TOKENS,
                params: [amountIn, path, this.walletAddress, deadline],
                value: amountOutMin
            },
            defaultGasLimit: this.defaultEstimateGas.ethToTokens[path.length - 2]
        };
    };

    private calculateTokensToEthGasLimit: GasCalculationMethod = (
        amountIn: string,
        amountOutMin: string,
        path: string[],
        deadline: number
    ) => {
        return {
            callData: {
                contractMethod: SWAP_METHOD.TOKENS_TO_ETH,
                params: [amountIn, amountOutMin, path, this.walletAddress, deadline]
            },
            defaultGasLimit: this.defaultEstimateGas.tokensToEth[path.length - 2]
        };
    };

    private createEthToTokensTrade: CreateTradeResponse = (
        trade: UniswapV2Trade,
        options: SwapCallbacks,
        gasLimit: string,
        gasPrice?: string
    ) => {
        return this.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.abi,
            SWAP_METHOD.ETH_TO_TOKENS,
            [trade.amountOutMin, trade.path, trade.to, trade.deadline],
            {
                onTransactionHash: options.onConfirm,
                value: trade.amountIn,
                gas: gasLimit,
                ...(gasPrice && { gasPrice })
            }
        );
    };

    private createTokensToEthTrade: CreateTradeResponse = (
        trade: UniswapV2Trade,
        options: SwapCallbacks,
        gasLimit: string,
        gasPrice?: string
    ) => {
        return this.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.abi,
            SWAP_METHOD.TOKENS_TO_ETH,
            [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
            {
                onTransactionHash: options.onConfirm,
                gas: gasLimit,
                ...(gasPrice && { gasPrice })
            }
        );
    };

    private createTokensToTokensTrade: CreateTradeResponse = (
        trade: UniswapV2Trade,
        options: SwapCallbacks,
        gasLimit: string,
        gasPrice?: string
    ) => {
        return this.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.abi,
            SWAP_METHOD.TOKENS_TO_TOKENS,
            [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
            {
                onTransactionHash: options.onConfirm,
                gas: gasLimit,
                ...(gasPrice && { gasPrice })
            }
        );
    };

    public async calculateTrade(
        fromToken: Token,
        fromAmount: BigNumber,
        toToken: Token,
        options: SwapOptions = {
            shouldCalculateGas: true,
            rubicOptimisation: true,
            disableMultihops: false,
            deadline: 1200000, // 20 min
            slippageTolerance: 0.05
        }
    ): Promise<InstantTrade> {
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
        let gasPriceInEth: BigNumber;
        let gasPriceInUsd: BigNumber | undefined;
        if (options.shouldCalculateGas) {
            gasPrice = await this.web3Public.getGasPrice();
            gasPriceInEth = Web3Public.fromWei(gasPrice);
            const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(blockchain);
            gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
        }

        const { route, estimatedGas } = await this.getToAmountAndPath(
            fromTokenAddress,
            toTokenClone,
            fromAmountAbsolute,
            {
                ...options,
                gasCalculationMethodName,
                gasPriceInUsd
            }
        );

        const instantTrade = {
            blockchain,
            from: {
                token: fromToken,
                amount: fromAmount
            },
            to: {
                token: toToken,
                amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
            },
            options: {
                path: route.path
            }
        };

        if (!options.shouldCalculateGas) {
            return instantTrade;
        }

        const increasedGas = Web3Public.calculateGasMargin(estimatedGas, this.GAS_MARGIN);
        const gasFeeInEth = gasPriceInEth!!.multipliedBy(increasedGas);
        const gasFeeInUsd = gasPriceInUsd!!.multipliedBy(increasedGas);

        return {
            ...instantTrade,
            gasLimit: increasedGas,
            gasPrice,
            gasFeeInUsd,
            gasFeeInEth
        };
    }

    private async getToAmountAndPath(
        fromTokenAddress: string,
        toToken: Token,
        fromAmountAbsolute: string,
        options: SwapOptions & {
            gasCalculationMethodName: GasCalculationMethod;
            gasPriceInUsd?: BigNumber;
        }
    ): Promise<UniswapCalculatedInfo> {
        const routes = (
            await this.getAllRoutes(
                fromTokenAddress,
                toToken.address,
                fromAmountAbsolute,
                this.routingProviders,
                options.disableMultihops ? 0 : this.maxTransitTokens,
                this.contractAddress,
                this.web3Public,
                'getAmountsOut'
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

        const gasRequests = routes.map(route =>
            options.gasCalculationMethodName(
                fromAmountAbsolute,
                route.outputAbsoluteAmount.multipliedBy(slippage).toFixed(0),
                route.path,
                deadline
            )
        );

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

    public async getFromAmount(
        blockchain: BLOCKCHAIN_NAME,
        fromTokenAddress: string,
        toToken: InstantTradeToken,
        toAmount: BigNumber,
        wethAddress: string,
        routingProviders: string[],
        maxTransitTokens: number,
        contractAddress: string
    ): Promise<BigNumber> {
        const toTokenClone = { ...toToken };
        const web3Public: Web3Public =
            this.web3PublicService[blockchain as Web3SupportedBlockchains];

        if (Web3Public.isNativeAddress(fromTokenAddress)) {
            fromTokenAddress = wethAddress;
        }
        if (Web3Public.isNativeAddress(toTokenClone.address)) {
            toTokenClone.address = wethAddress;
        }

        const toAmountAbsolute = Web3Public.toWei(toAmount, toToken.decimals);
        const routes = (
            await this.getAllRoutes(
                fromTokenAddress,
                toToken.address,
                toAmountAbsolute,
                routingProviders,
                maxTransitTokens,
                contractAddress,
                web3Public,
                'getAmountsIn'
            )
        ).sort((a, b) => (b.outputAbsoluteAmount.lt(a.outputAbsoluteAmount) ? 1 : -1));
        return routes[0]?.outputAbsoluteAmount;
    }

    public async createTrade(
        trade: InstantTrade,
        contractAddress: string,
        options: ItOptions = {}
    ) {
        this.providerConnectorService.checkSettings(trade.blockchain);

        const web3Public = this.web3PublicService[trade.blockchain as Web3SupportedBlockchains];
        await web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

        const uniswapV2Trade: UniswapV2Trade = {
            amountIn: Web3Public.toWei(trade.from.amount, trade.from.token.decimals),
            amountOutMin: Web3Public.toWei(
                trade.to.amount.multipliedBy(
                    new BigNumber(1).minus(this.settings.slippageTolerance)
                ),
                trade.to.token.decimals
            ),
            // @ts-ignore
            path: trade.options.path,
            to: this.walletAddress,
            deadline: Math.floor(Date.now() / 1000) + 60 * this.settings.deadline
        };

        let createTradeMethod = this.createTokensToTokensTrade;
        if (Web3Public.isNativeAddress(trade.from.token.address)) {
            createTradeMethod = this.createEthToTokensTrade;
        }
        if (Web3Public.isNativeAddress(trade.to.token.address)) {
            createTradeMethod = this.createTokensToEthTrade;
        }

        return createTradeMethod(
            uniswapV2Trade,
            options,
            contractAddress,
            trade.gasLimit,
            trade.gasPrice
        );
    }
}
