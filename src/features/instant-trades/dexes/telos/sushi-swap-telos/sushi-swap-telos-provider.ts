import { SUSHI_SWAP_TELOS_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/telos/sushi-swap-telos/constants';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SushiSwapTelosTrade } from 'src/features/instant-trades/dexes/telos/sushi-swap-telos/sushi-swap-telos-trade';

export class SushiSwapTelosProvider extends UniswapV2AbstractProvider<SushiSwapTelosTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.TELOS;

    public readonly InstantTradeClass = SushiSwapTelosTrade;

    public readonly providerSettings = SUSHI_SWAP_TELOS_PROVIDER_CONFIGURATION;
}
