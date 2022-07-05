import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { TrisolarisAuroraTrade } from '@rsdk-features/instant-trades/dexes/aurora/trisolaris-aurora/trisolaris-aurora-trade';
import { TRISOLARIS_AURORA_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/aurora/trisolaris-aurora/constants';

export class TrisolarisAuroraProvider extends UniswapV2AbstractProvider<TrisolarisAuroraTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AURORA;

    public readonly InstantTradeClass = TrisolarisAuroraTrade;

    public readonly providerSettings = TRISOLARIS_AURORA_PROVIDER_CONFIGURATION;
}
