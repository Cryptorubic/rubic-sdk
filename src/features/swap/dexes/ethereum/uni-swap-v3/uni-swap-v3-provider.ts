import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniSwapV3Trade } from '@features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-trade';
import { UniswapV3AbstractProvider } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UNI_SWAP_V3_PROVIDER_CONFIGURATION } from '@features/swap/dexes/ethereum/uni-swap-v3/constants/provider-configuration';
import { UNI_SWAP_V3_ROUTER_CONFIGURATION } from '@features/swap/dexes/ethereum/uni-swap-v3/constants/router-configuration';

export class UniSwapV3Provider extends UniswapV3AbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = UniSwapV3Trade;

    public readonly providerConfiguration = UNI_SWAP_V3_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_ROUTER_CONFIGURATION;
}
