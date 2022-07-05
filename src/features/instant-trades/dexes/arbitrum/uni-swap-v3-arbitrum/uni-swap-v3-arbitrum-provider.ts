import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniSwapV3ArbitrumTrade } from '@rsdk-features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-trade';
import { UNI_SWAP_V3_ARBITRUM_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/constants/provider-configuration';
import { UNI_SWAP_V3_ARBITRUM_ROUTER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/arbitrum/uni-swap-v3-arbitrum/constants/router-configuration';

export class UniSwapV3ArbitrumProvider extends UniswapV3AbstractProvider<UniSwapV3ArbitrumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ARBITRUM;

    protected readonly InstantTradeClass = UniSwapV3ArbitrumTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_ARBITRUM_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_ARBITRUM_ROUTER_CONFIGURATION;
}
