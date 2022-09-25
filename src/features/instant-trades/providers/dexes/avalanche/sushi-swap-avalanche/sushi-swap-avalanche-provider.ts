import { SushiSwapAvalancheTrade } from 'src/features/instant-trades/providers/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-trade';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SUSHI_SWAP_AVALANCHE_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/avalanche/sushi-swap-avalanche/constants';

export class SushiSwapAvalancheProvider extends UniswapV2AbstractProvider<SushiSwapAvalancheTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly InstantTradeClass = SushiSwapAvalancheTrade;

    public readonly providerSettings = SUSHI_SWAP_AVALANCHE_PROVIDER_CONFIGURATION;
}
