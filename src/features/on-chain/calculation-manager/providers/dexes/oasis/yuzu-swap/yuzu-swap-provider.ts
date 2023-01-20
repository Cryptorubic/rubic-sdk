import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { YUZU_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/oasis/yuzu-swap/constants';
import { YuzuSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/oasis/yuzu-swap/yuzu-swap-trade';

export class YuzuSwapProvider extends UniswapV2AbstractProvider<YuzuSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.OASIS;

    public readonly UniswapV2TradeClass = YuzuSwapTrade;

    public readonly providerSettings = YUZU_SWAP_PROVIDER_CONFIGURATION;
}
