import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { WannaSwapAuroraTrade } from '@features/instant-trades/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-trade';
import { WANNA_SWAP_AURORA_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/aurora/wanna-swap-aurora/constants';

export class WannaSwapAuroraProvider extends UniswapV2AbstractProvider<WannaSwapAuroraTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AURORA;

    public readonly InstantTradeClass = WannaSwapAuroraTrade;

    public readonly providerSettings = WANNA_SWAP_AURORA_PROVIDER_CONFIGURATION;
}
