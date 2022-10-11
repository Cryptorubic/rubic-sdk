import { UniswapV3Route } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { MethodData } from '@rsdk-core/blockchain/web3-public/models/method-data';
import { UniswapV3QuoterController } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { compareAddresses, RubicSdkError } from 'src/common';
import { Cache } from '@rsdk-common/decorators/cache.decorator';
import { Token } from '@rsdk-core/blockchain/tokens/token';
import {
    UniswapV3AlgebraAbstractTrade,
    UniswapV3AlgebraTradeStruct
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';

import {
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI,
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { createTokenNativeAddressProxyInPathStartAndEnd } from '@rsdk-features/instant-trades/dexes/common/utils/token-native-address-proxy';
import { Web3Pure } from 'src/core';
import { TRADE_TYPE, TradeType } from 'src/features';

export interface UniswapV3TradeStruct extends UniswapV3AlgebraTradeStruct {
    route: UniswapV3Route;
}

export abstract class UniswapV3AbstractTrade extends UniswapV3AlgebraAbstractTrade {
    protected readonly contractAddress = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName = 'unwrapWETH9';

    public readonly route: UniswapV3Route;

    public static get type(): TradeType {
        return TRADE_TYPE.UNI_SWAP_V3;
    }

    @Cache
    public get path(): ReadonlyArray<Token> {
        const initialPool = this.route.poolsPath[0];
        if (!initialPool) {
            throw new RubicSdkError('Initial pool has to be defined');
        }
        const path: Token[] = [
            compareAddresses(initialPool.token0.address, this.route.initialTokenAddress)
                ? initialPool.token0
                : initialPool.token1
        ];

        const lastToken = path[path.length - 1];
        if (!lastToken) {
            throw new RubicSdkError('Last token has to be defined');
        }

        this.route.poolsPath.forEach(pool => {
            path.push(
                !compareAddresses(pool.token0.address, lastToken.address)
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
        const amountParams = this.getAmountParams();

        if (this.route.poolsPath.length === 1) {
            const methodName = this.exact === 'input' ? 'exactInputSingle' : 'exactOutputSingle';

            const pool = this.route.poolsPath[0];
            if (!pool) {
                throw new RubicSdkError('Initial pool has to be defined');
            }
            const toTokenAddress = compareAddresses(
                pool.token0.address,
                this.route.initialTokenAddress
            )
                ? pool.token1.address
                : pool.token0.address;

            if (!this.route?.poolsPath?.[0]) {
                throw new RubicSdkError('PoolsPath[0] has to be defined');
            }

            return {
                methodName,
                methodArguments: [
                    [
                        this.route.initialTokenAddress,
                        toTokenAddress,
                        this.route.poolsPath[0].fee,
                        walletAddress,
                        this.deadlineMinutesTimestamp,
                        ...amountParams,
                        0
                    ]
                ]
            };
        }

        const methodName = this.exact === 'input' ? 'exactInput' : 'exactOutput';

        return {
            methodName,
            methodArguments: [
                [
                    UniswapV3QuoterController.getEncodedPoolsPath(
                        this.route.poolsPath,
                        this.route.initialTokenAddress
                    ),
                    walletAddress,
                    this.deadlineMinutesTimestamp,
                    ...amountParams
                ]
            ]
        };
    }
}
