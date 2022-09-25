import { SUSHI_SWAP_ETHEREUM_POW_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/ethereum-pow/sushi-swap-ethereum-pow/constants';
import { SushiSwapEthereumPowTrade } from 'src/features/instant-trades/providers/dexes/ethereum-pow/sushi-swap-ethereum-pow/sushi-swap-ethereum-pow-trade';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class SushiSwapEthereumPowProvider extends UniswapV2AbstractProvider<SushiSwapEthereumPowTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM_POW;

    public readonly InstantTradeClass = SushiSwapEthereumPowTrade;

    public readonly providerSettings = SUSHI_SWAP_ETHEREUM_POW_PROVIDER_CONFIGURATION;
}
