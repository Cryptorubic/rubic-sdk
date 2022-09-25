import { WannaSwapAuroraTrade } from 'src/features/instant-trades/providers/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-trade';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { WANNA_SWAP_AURORA_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/aurora/wanna-swap-aurora/constants';

export class WannaSwapAuroraProvider extends UniswapV2AbstractProvider<WannaSwapAuroraTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AURORA;

    public readonly InstantTradeClass = WannaSwapAuroraTrade;

    public readonly providerSettings = WANNA_SWAP_AURORA_PROVIDER_CONFIGURATION;
}
