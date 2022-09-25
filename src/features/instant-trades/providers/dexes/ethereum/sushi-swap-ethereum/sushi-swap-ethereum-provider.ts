import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapEthereumTrade } from 'src/features/instant-trades/providers/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-trade';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/ethereum/sushi-swap-ethereum/constants';

export class SushiSwapEthereumProvider extends UniswapV2AbstractProvider<SushiSwapEthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = SushiSwapEthereumTrade;

    public readonly providerSettings = SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION;
}
