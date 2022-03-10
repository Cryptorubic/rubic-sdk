import {
    UniswapV3AlgebraAbstractTrade,
    UniswapV3AlgebraTradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { AlgebraRoute } from '@features/instant-trades/dexes/polygon/algebra/models/algebra-route';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { AlgebraQuoterController } from '@features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { TRADE_TYPE, TradeType } from 'src/features';

import {
    ALGEBRA_SWAP_ROUTER_CONTRACT_ABI,
    ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS
} from '@features/instant-trades/dexes/polygon/algebra/constants/swap-router-contract-data';
import { Token, Web3Pure } from 'src/core';
import { createTokenNativeAddressProxyInPathStartAndEnd } from '@features/instant-trades/dexes/common/utils/token-native-address-proxy';

export interface AlgebraTradeStruct extends UniswapV3AlgebraTradeStruct {
    route: AlgebraRoute;
}

export class AlgebraTrade extends UniswapV3AlgebraAbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.ALGEBRA;
    }

    protected readonly contractAddress = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = ALGEBRA_SWAP_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName = 'unwrapWNativeToken';

    private readonly route: AlgebraRoute;

    public readonly wrappedPath: ReadonlyArray<Token>;

    public readonly path: ReadonlyArray<Token>;

    constructor(tradeStruct: AlgebraTradeStruct) {
        super(tradeStruct);

        this.route = tradeStruct.route;

        this.wrappedPath = this.route.path;
        this.path = createTokenNativeAddressProxyInPathStartAndEnd(
            this.route.path,
            Web3Pure.nativeTokenAddress
        );
    }

    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    protected getSwapRouterExactInputMethodData(walletAddress: string): MethodData {
        const amountParams = this.getAmountParams();

        if (this.route.path.length === 2) {
            const methodName = this.exact === 'input' ? 'exactInputSingle' : 'exactOutputSingle';

            return {
                methodName,
                methodArguments: [
                    [
                        this.route.path[0].address,
                        this.route.path[1].address,
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
                    AlgebraQuoterController.getEncodedPath(this.route.path),
                    walletAddress,
                    this.deadlineMinutesTimestamp,
                    ...amountParams
                ]
            ]
        };
    }
}
