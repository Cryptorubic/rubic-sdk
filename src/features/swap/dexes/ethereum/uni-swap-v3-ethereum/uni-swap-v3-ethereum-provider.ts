import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniSwapV3EthereumTrade } from '@features/swap/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-trade';
import { UniswapV3AbstractProvider } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION } from '@features/swap/dexes/ethereum/uni-swap-v3-ethereum/constants/provider-configuration';
import { UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION } from '@features/swap/dexes/ethereum/uni-swap-v3-ethereum/constants/router-configuration';

export class UniSwapV3EthereumProvider extends UniswapV3AbstractProvider<UniSwapV3EthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    protected readonly InstantTradeClass = UniSwapV3EthereumTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION;
}
