import { UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/constants';
import { UniSwapV2EthereumTrade } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-trade';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class UniSwapV2EthereumProvider extends UniswapV2AbstractProvider<UniSwapV2EthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = UniSwapV2EthereumTrade;

    public readonly providerSettings = UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION;
}
