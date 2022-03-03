import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { TrisolarisAuroraTrade } from '@features/instant-trades/dexes/aurora/trisolaris-aurora/trisolaris-aurora-trade';
import { TRISOLARIS_AURORA_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/aurora/trisolaris-aurora/constants';

export class TrisolarisAuroraProvider extends UniswapV2AbstractProvider<TrisolarisAuroraTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AURORA;

    public readonly InstantTradeClass = TrisolarisAuroraTrade;

    public readonly providerSettings = TRISOLARIS_AURORA_PROVIDER_CONFIGURATION;
}
