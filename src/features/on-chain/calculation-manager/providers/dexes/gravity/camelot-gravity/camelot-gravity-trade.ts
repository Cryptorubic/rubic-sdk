import { Token } from 'src/common/tokens';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { AlgebraQuoterController } from '../../common/algebra/algebra-quoter-controller';
import { UniswapV3AlgebraAbstractTrade } from '../../common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { QUICK_SWAP_V3_ROUTER_CONTRACT_ABI } from '../../polygon/quick-swap-v3/constants/swap-router-contract-data';
import { QuickSwapV3Route } from '../../polygon/quick-swap-v3/models/quick-swap-v3-route';
import { QuickSwapV3TradeStruct } from '../../polygon/quick-swap-v3/models/quick-swap-v3-trade-struct';
import { CAMELOT_GRAVITY_ROUTER_CONTRACT_ADDRESS } from './constants/gravity-swap-router-contract-address';

export class CamelotGravityTrade extends UniswapV3AlgebraAbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.CAMELOT;
    }

    public readonly dexContractAddress = CAMELOT_GRAVITY_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = QUICK_SWAP_V3_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName = 'unwrapWNativeToken';

    private readonly route: QuickSwapV3Route;

    public readonly wrappedPath: ReadonlyArray<Token>;

    constructor(tradeStruct: QuickSwapV3TradeStruct, providerAddress: string) {
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
