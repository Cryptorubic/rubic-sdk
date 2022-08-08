import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/ethereum/sushi-swap-ethereum/constants';
import { SushiSwapEthereumTrade } from '@rsdk-features/instant-trades/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-trade';

export class SushiSwapEthereumProvider extends UniswapV2AbstractProvider<SushiSwapEthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = SushiSwapEthereumTrade;

    public readonly providerSettings = SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION;
}
