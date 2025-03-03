import { RubicSdkError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import {
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI,
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { UniswapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { UniswapV3TradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-struct';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { UnwrapWethMethodName } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/unwrapWethMethodName';
import { UniswapV3AlgebraAbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';

export abstract class UniswapV3AbstractTrade extends UniswapV3AlgebraAbstractTrade {
    public readonly dexContractAddress: string;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected readonly unwrapWethMethodName: UnwrapWethMethodName = 'unwrapWETH9';

    public readonly route: UniswapV3Route;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3;
    }

    public constructor(
        tradeStruct: UniswapV3TradeStruct,
        providerAddress: string,
        dexContractAddress: string = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS
    ) {
        super(tradeStruct, providerAddress);

        this.dexContractAddress = dexContractAddress;
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
