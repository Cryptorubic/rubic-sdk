import { Token } from 'src/common/tokens';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { UniswapV3AlgebraAbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { ModeAlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/algebra-mode/models/mode-algebra-route';
import { ModeAlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/algebra-mode/models/mode-algebra-trade-struct';

import {
    MODE_ALGEBRA_ROUTER_CONTRACT_ABI,
    MODE_ALGEBRA_ROUTER_CONTRACT_ADDRESS
} from './constants/swap-router-contract-data';

export class ModeAlgebraTrade extends UniswapV3AlgebraAbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.KIM;
    }

    public readonly dexContractAddress = MODE_ALGEBRA_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = MODE_ALGEBRA_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName = 'unwrapWNativeToken';

    private readonly route: ModeAlgebraRoute;

    public readonly wrappedPath: ReadonlyArray<Token>;

    constructor(tradeStruct: ModeAlgebraTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this.route = tradeStruct.route;

        this.wrappedPath = this.route.path;
    }

    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    protected getSwapRouterExactInputMethodData(walletAddress: string): MethodData {
        const amountParams = this.getAmountParams();

        if (this.route.path.length === 2 && this.route?.path?.[0] && this.route?.path?.[1]) {
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
