import { SushiSwapFantomTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/sushi-swap-fantom/constants';

export class SushiSwapFantomProvider extends UniswapV2AbstractProvider<SushiSwapFantomTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly UniswapV2TradeClass = SushiSwapFantomTrade;

    public readonly providerSettings = SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION;
}
