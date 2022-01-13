import {
    UniswapV3AlgebraAbstractTrade,
    UniswapV3AlgebraTradeStruct
} from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { AlgebraRoute } from '@features/swap/dexes/polygon/algebra/models/algebra-route';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { AlgebraQuoterController } from '@features/swap/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { TRADE_TYPE, TradeType } from 'src/features';

import {
    ALGEBRA_SWAP_ROUTER_CONTRACT_ABI,
    ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS
} from '@features/swap/dexes/polygon/algebra/constants/swap-router-contract-data';
import { Token, Web3Pure } from 'src/core';
import { createTokenNativeAddressProxyInPathStartAndEnd } from '@features/swap/dexes/common/utils/token-native-address-proxy';

export interface AlgebraTradeStruct extends UniswapV3AlgebraTradeStruct {
    route: AlgebraRoute;
}

export class AlgebraTrade extends UniswapV3AlgebraAbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.ALGEBRA;
    }

    protected readonly contractAddress = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = ALGEBRA_SWAP_ROUTER_CONTRACT_ABI;

    private readonly route: AlgebraRoute;

    public readonly path: ReadonlyArray<Token>;

    constructor(tradeStruct: AlgebraTradeStruct) {
        super(tradeStruct);

        this.route = tradeStruct.route;

        this.path = createTokenNativeAddressProxyInPathStartAndEnd(
            this.route.path,
            Web3Pure.nativeTokenAddress
        );
    }

    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    protected getSwapRouterExactInputMethodData(walletAddress: string): MethodData {
        const amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);

        if (this.route.path.length === 2) {
            return {
                methodName: 'exactInputSingle',
                methodArguments: [
                    [
                        this.route.path[0].address,
                        this.to.address,
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
                    AlgebraQuoterController.getEncodedPath(this.route.path),
                    walletAddress,
                    this.deadlineMinutesTimestamp,
                    this.from.stringWeiAmount,
                    amountOutMin
                ]
            ]
        };
    }
}
