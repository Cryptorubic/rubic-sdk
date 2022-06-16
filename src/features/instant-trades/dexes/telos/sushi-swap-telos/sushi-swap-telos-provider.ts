import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapTelosTrade } from '@rsdk-features/instant-trades/dexes/telos/sushi-swap-telos/sushi-swap-telos-trade';
import { SUSHI_SWAP_TELOS_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/telos/sushi-swap-telos/constants';

export class SushiSwapTelosProvider extends UniswapV2AbstractProvider<SushiSwapTelosTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.TELOS;

    public readonly InstantTradeClass = SushiSwapTelosTrade;

    public readonly providerSettings = SUSHI_SWAP_TELOS_PROVIDER_CONFIGURATION;
}
