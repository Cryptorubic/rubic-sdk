import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ArthSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/astar-evm/arth-swap/arth-swap-trade';
import { ARTH_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/astar-evm/arth-swap/constants';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class ArthSwapProvider extends UniswapV2AbstractProvider<ArthSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ASTAR_EVM;

    public readonly UniswapV2TradeClass = ArthSwapTrade;

    public readonly providerSettings = ARTH_SWAP_PROVIDER_CONFIGURATION;
}
