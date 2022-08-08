import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_MOONRIVER_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/moonriver/sushi-swap-moonriver/constants';
import { SushiSwapMoonriverTrade } from '@rsdk-features/instant-trades/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-trade';

export class SushiSwapMoonriverProvider extends UniswapV2AbstractProvider<SushiSwapMoonriverTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MOONRIVER;

    public readonly InstantTradeClass = SushiSwapMoonriverTrade;

    public readonly providerSettings = SUSHI_SWAP_MOONRIVER_PROVIDER_CONFIGURATION;
}
