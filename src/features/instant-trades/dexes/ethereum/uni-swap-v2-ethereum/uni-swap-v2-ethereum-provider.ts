import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/constants';
import { UniSwapV2EthereumTrade } from '@features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-trade';

export class UniSwapV2EthereumProvider extends UniswapV2AbstractProvider<UniSwapV2EthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = UniSwapV2EthereumTrade;

    public readonly providerSettings = UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION;
}
