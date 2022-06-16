import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapArbitrumTrade } from '@rsdk-features/instant-trades/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-trade';
import { SUSHI_SWAP_ARBITRUM_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/arbitrum/sushi-swap-arbitrum/constants';

export class SushiSwapArbitrumProvider extends UniswapV2AbstractProvider<SushiSwapArbitrumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ARBITRUM;

    public readonly InstantTradeClass = SushiSwapArbitrumTrade;

    public readonly providerSettings = SUSHI_SWAP_ARBITRUM_PROVIDER_CONFIGURATION;
}
