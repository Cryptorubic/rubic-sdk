import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { QUICK_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap/constants';
import { QuickSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap/quick-swap-trade';

export class QuickSwapProvider extends UniswapV2AbstractProvider<QuickSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    public readonly UniswapV2TradeClass = QuickSwapTrade;

    public readonly providerSettings = QUICK_SWAP_PROVIDER_CONFIGURATION;
}
