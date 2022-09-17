import { UniSwapV3EthereumPowTrade } from 'src/features/instant-trades/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/uni-swap-v3-ethereum-pow-trade';
import { UNI_SWAP_V3_ETHEREUM_POW_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/constants/provider-configuration';
import { UNI_SWAP_V3_ETHEREUM_POW_ROUTER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/constants/router-configuration';
import { UniswapV3AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class UniSwapV3EthereumPowProvider extends UniswapV3AbstractProvider<UniSwapV3EthereumPowTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM_POW;

    public readonly InstantTradeClass = UniSwapV3EthereumPowTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_ETHEREUM_POW_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_ETHEREUM_POW_ROUTER_CONFIGURATION;
}
