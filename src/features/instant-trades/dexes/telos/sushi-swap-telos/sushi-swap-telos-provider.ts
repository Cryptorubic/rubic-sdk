import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapTelosTrade } from '@features/instant-trades/dexes/telos/sushi-swap-telos/sushi-swap-telos-trade';
import { SUSHI_SWAP_TELOS_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/telos/sushi-swap-telos/constants';

export class SushiSwapTelosProvider extends UniswapV2AbstractProvider<SushiSwapTelosTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.TELOS;

    public readonly InstantTradeClass = SushiSwapTelosTrade;

    public readonly providerSettings = SUSHI_SWAP_TELOS_PROVIDER_CONFIGURATION;
}
