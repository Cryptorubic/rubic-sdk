import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniSwapV3EthereumTrade } from '@features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-trade';
import { UniswapV3AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/constants/provider-configuration';
import { UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION } from '@features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/constants/router-configuration';

export class UniSwapV3EthereumProvider extends UniswapV3AbstractProvider<UniSwapV3EthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = UniSwapV3EthereumTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION;
}
