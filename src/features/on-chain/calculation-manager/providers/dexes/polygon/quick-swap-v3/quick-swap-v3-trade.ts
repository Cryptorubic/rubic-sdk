import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/token-native-address-proxy';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import {
    UniswapV3AlgebraAbstractTrade,
    UniswapV3AlgebraTradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { Token } from 'src/common/tokens';
import { QuickSwapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/models/quick-swap-v3-route';
import {
    QUICK_SWAP_V3_ROUTER_CONTRACT_ABI,
    QUICK_SWAP_V3_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/constants/swap-router-contract-data';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';

export interface QuickSwapV3TradeStruct extends UniswapV3AlgebraTradeStruct {
    route: QuickSwapV3Route;
}

export class QuickSwapV3Trade extends UniswapV3AlgebraAbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.QUICK_SWAP_V3;
    }

    public readonly contractAddress = QUICK_SWAP_V3_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = QUICK_SWAP_V3_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName = 'unwrapWNativeToken';

    private readonly route: QuickSwapV3Route;

    public readonly wrappedPath: ReadonlyArray<Token>;

    public readonly path: ReadonlyArray<Token>;

    constructor(tradeStruct: QuickSwapV3TradeStruct) {
        super(tradeStruct);

        this.route = tradeStruct.route;

        this.wrappedPath = this.route.path;
        this.path = createTokenNativeAddressProxyInPathStartAndEnd(
            this.route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
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
