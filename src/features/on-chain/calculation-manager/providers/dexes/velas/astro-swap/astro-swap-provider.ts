import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { AstroSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/astro-swap/astro-swap-trade';
import { ASTRO_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/astro-swap/constants';

export class AstroSwapProvider extends UniswapV2AbstractProvider<AstroSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.VELAS;

    public readonly UniswapV2TradeClass = AstroSwapTrade;

    public readonly providerSettings = ASTRO_SWAP_PROVIDER_CONFIGURATION;
}
