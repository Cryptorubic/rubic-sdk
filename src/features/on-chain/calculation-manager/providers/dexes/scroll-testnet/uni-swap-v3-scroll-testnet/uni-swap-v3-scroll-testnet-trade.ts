import { Token } from 'src/common/tokens';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { UniswapV3AlgebraAbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { ALGEBRA_SWAP_ROUTER_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/constants/swap-router-contract-data';
import { AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-route';
import { AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-trade-struct';

export class UniSwapV3ScrollTestnetTrade extends UniswapV3AlgebraAbstractTrade {
    public readonly dexContractAddress = '0xD9880690bd717189cC3Fbe7B9020F27fae7Ac76F';

    protected readonly contractAbi = ALGEBRA_SWAP_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName = 'unwrapWNativeToken';

    private readonly route: AlgebraRoute;

    public readonly wrappedPath: ReadonlyArray<Token>;

    constructor(tradeStruct: AlgebraTradeStruct, providerAddress: string) {
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
