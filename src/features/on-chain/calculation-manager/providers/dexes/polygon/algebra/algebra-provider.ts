import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import {
    ALGEBRA_SWAP_ROUTER_CONTRACT_ABI,
    ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/constants/swap-router-contract-data';
import { ALGEBRA_V3_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/constants/provider-configuration';
import { UniswapV3AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { AlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-trade';
import { AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-route';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';

export class AlgebraProvider extends UniswapV3AlgebraAbstractProvider<AlgebraTrade> {
    public readonly contractAddress = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = ALGEBRA_SWAP_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly OnChainTradeClass = AlgebraTrade;

    protected readonly quoterController = new AlgebraQuoterController();

    public readonly providerConfiguration = ALGEBRA_V3_PROVIDER_CONFIGURATION;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ALGEBRA;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStruct,
        route: AlgebraRoute,
        useProxy: boolean,
        providerAddress: string
    ): AlgebraTrade {
        return new AlgebraTrade(
            {
                ...tradeStruct,
                route
            },
            useProxy,
            providerAddress
        );
    }
}
