import { PancakeSwapTrade } from 'src/features/on-chain/providers/dexes/bsc/pancake-swap/pancake-swap-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PANCAKE_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/providers/dexes/bsc/pancake-swap/constants';

export class PancakeSwapProvider extends UniswapV2AbstractProvider<PancakeSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly UniswapV2TradeClass = PancakeSwapTrade;

    public readonly providerSettings = PANCAKE_SWAP_PROVIDER_CONFIGURATION;
}
