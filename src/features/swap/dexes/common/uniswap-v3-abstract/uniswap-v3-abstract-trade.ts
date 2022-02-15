import { UniswapV3Route } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { UniswapV3QuoterController } from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { Cache, compareAddresses } from 'src/common';
import { Token } from '@core/blockchain/tokens/token';
import {
    UniswapV3AlgebraAbstractTrade,
    UniswapV3AlgebraTradeStruct
} from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';

import {
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI,
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from '@features/swap/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { createTokenNativeAddressProxyInPathStartAndEnd } from '@features/swap/dexes/common/utils/token-native-address-proxy';
import { Web3Pure } from 'src/core';

export interface UniswapV3TradeStruct extends UniswapV3AlgebraTradeStruct {
    route: UniswapV3Route;
}

export abstract class UniswapV3AbstractTrade extends UniswapV3AlgebraAbstractTrade {
    protected readonly contractAddress = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName = 'unwrapWETH9';

    private readonly route: UniswapV3Route;

    @Cache
    public get path(): ReadonlyArray<Token> {
        const initialPool = this.route.poolsPath[0];
        const path: Token[] = [
            compareAddresses(initialPool.token0.address, this.route.initialTokenAddress)
                ? initialPool.token0
                : initialPool.token1
        ];

        this.route.poolsPath.forEach(pool => {
            path.push(
                !compareAddresses(pool.token0.address, path[path.length - 1].address)
                    ? pool.token0
                    : pool.token1
            );
        });

        return createTokenNativeAddressProxyInPathStartAndEnd(path, Web3Pure.nativeTokenAddress);
    }

    protected constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);

        this.route = tradeStruct.route;
    }

    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    protected getSwapRouterExactInputMethodData(walletAddress: string): MethodData {
        const amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);

        if (this.route.poolsPath.length === 1) {
            const pool = this.route.poolsPath[0];
            const toTokenAddress = compareAddresses(
                pool.token0.address,
                this.route.initialTokenAddress
            )
                ? pool.token1.address
                : pool.token0.address;

            return {
                methodName: 'exactInputSingle',
                methodArguments: [
                    [
                        this.route.initialTokenAddress,
                        toTokenAddress,
                        this.route.poolsPath[0].fee,
                        walletAddress,
                        this.deadlineMinutesTimestamp,
                        this.from.stringWeiAmount,
                        amountOutMin,
                        0
                    ]
                ]
            };
        }
        return {
            methodName: 'exactInput',
            methodArguments: [
                [
                    UniswapV3QuoterController.getEncodedPoolsPath(
                        this.route.poolsPath,
                        this.route.initialTokenAddress
                    ),
                    walletAddress,
                    this.deadlineMinutesTimestamp,
                    this.from.stringWeiAmount,
                    amountOutMin
                ]
            ]
        };
    }
}
