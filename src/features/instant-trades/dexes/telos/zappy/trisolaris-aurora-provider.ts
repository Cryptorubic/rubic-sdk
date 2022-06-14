import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { ZappyTrade } from '@features/instant-trades/dexes/telos/zappy/trisolaris-aurora-trade';
import { ZAPPY_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/telos/zappy/constants';

export class ZappyProvider extends UniswapV2AbstractProvider<ZappyTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.TELOS;

    public readonly InstantTradeClass = ZappyTrade;

    public readonly providerSettings = ZAPPY_PROVIDER_CONFIGURATION;
}
