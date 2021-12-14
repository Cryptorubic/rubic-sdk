import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION } from '@features/swap/dexes/ethereum/sushi-swap-ethereum/constants';
import { SushiSwapEthereumTrade } from '@features/swap/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-trade';

export class SushiSwapEthereumProvider extends UniswapV2AbstractProvider<SushiSwapEthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = SushiSwapEthereumTrade;

    public readonly providerSettings = SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION;
}
