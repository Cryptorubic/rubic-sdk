import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { QUICK_SWAP_MUMBAI_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/mumbai/quick-swap-mumbai/constants';
import { QuickSwapMumbaiTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/mumbai/quick-swap-mumbai/quick-swap-mumbai-trade';

export class QuickSwapMumbaiProvider extends UniswapV2AbstractProvider<QuickSwapMumbaiTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MUMBAI;

    public readonly UniswapV2TradeClass = QuickSwapMumbaiTrade;

    public readonly providerSettings = QUICK_SWAP_MUMBAI_PROVIDER_CONFIGURATION;
}
