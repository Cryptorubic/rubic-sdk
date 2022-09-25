import { SushiSwapArbitrumTrade } from 'src/features/instant-trades/providers/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-trade';
import { SUSHI_SWAP_ARBITRUM_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/arbitrum/sushi-swap-arbitrum/constants';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class SushiSwapArbitrumProvider extends UniswapV2AbstractProvider<SushiSwapArbitrumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ARBITRUM;

    public readonly InstantTradeClass = SushiSwapArbitrumTrade;

    public readonly providerSettings = SUSHI_SWAP_ARBITRUM_PROVIDER_CONFIGURATION;
}
