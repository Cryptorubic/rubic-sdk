import { SOUL_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/soul-swap/constants';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SoulSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/soul-swap/soul-swap-trade';

export class SoulSwapProvider extends UniswapV2AbstractProvider<SoulSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly UniswapV2TradeClass = SoulSwapTrade;

    public readonly providerSettings = SOUL_SWAP_PROVIDER_CONFIGURATION;
}
