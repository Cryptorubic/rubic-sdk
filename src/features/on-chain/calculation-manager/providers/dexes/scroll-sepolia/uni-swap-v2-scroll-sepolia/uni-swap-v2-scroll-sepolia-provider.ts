import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_SCROLL_SEPOLIA_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v2-scroll-sepolia/constants';
import { UniSwapV2ScrollSepoliaTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v2-scroll-sepolia/uni-swap-v2-scroll-sepolia-trade';

export class UniSwapV2ScrollSepoliaProvider extends UniswapV2AbstractProvider<UniSwapV2ScrollSepoliaTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.SCROLL_SEPOLIA;

    public readonly UniswapV2TradeClass = UniSwapV2ScrollSepoliaTrade;

    public readonly providerSettings = UNISWAP_V2_SCROLL_SEPOLIA_CONFIGURATION;
}
