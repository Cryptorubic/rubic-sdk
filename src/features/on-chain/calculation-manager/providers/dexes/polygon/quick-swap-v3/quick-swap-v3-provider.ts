import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { UniswapV3AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { QuickSwapV3Trade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/quick-swap-v3-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    QUICK_SWAP_V3_ROUTER_CONTRACT_ABI,
    QUICK_SWAP_V3_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/constants/swap-router-contract-data';
import { QUICK_SWAP_V3_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/constants/provider-configuration';
import { QuickSwapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/utils/quoter-controller/quick-swap-v3-quoter-controller';
import { QuickSwapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/models/quick-swap-v3-route';

export class QuickSwapV3Provider extends UniswapV3AlgebraAbstractProvider<QuickSwapV3Trade> {
    protected readonly contractAddress = QUICK_SWAP_V3_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = QUICK_SWAP_V3_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly OnChainTradeClass = QuickSwapV3Trade;

    protected readonly quoterController = new QuickSwapV3QuoterController();

    public readonly providerConfiguration = QUICK_SWAP_V3_PROVIDER_CONFIGURATION;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.QUICK_SWAP_V3;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStruct,
        route: QuickSwapV3Route
    ): QuickSwapV3Trade {
        return new QuickSwapV3Trade({
            ...tradeStruct,
            route
        });
    }
}
