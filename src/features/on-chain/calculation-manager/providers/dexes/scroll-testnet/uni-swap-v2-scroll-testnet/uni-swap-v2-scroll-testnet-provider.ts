import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_SCROLL_TESTNET_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v2-scroll-testnet/constants';
import { UniSwapV2ScrollTestnetTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v2-scroll-testnet/uni-swap-v2-scroll-testnet-trade';

export class UniSwapV2ScrollTestnetProvider extends UniswapV2AbstractProvider<UniSwapV2ScrollTestnetTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.SCROLL_TESTNET;

    public readonly UniswapV2TradeClass = UniSwapV2ScrollTestnetTrade;

    public readonly providerSettings = UNISWAP_V2_SCROLL_TESTNET_CONFIGURATION;
}
