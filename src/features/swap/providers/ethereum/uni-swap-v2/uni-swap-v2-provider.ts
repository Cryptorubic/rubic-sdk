import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/providers/common/uniswap-v2-abstract-provider/uniswap-v2-abstract-provider';
import { UNISWAP_V2_PROVIDER_CONFIGURATION } from '@features/swap/providers/ethereum/uni-swap-v2/constants';
import { UniSwapV2Trade } from '@features/swap/trades/ethereum/uni-swap-v2/uni-swap-v2-trade';

export class UniSwapV2Provider extends UniswapV2AbstractProvider<UniSwapV2Trade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = UniSwapV2Trade;

    public readonly providerSettings = UNISWAP_V2_PROVIDER_CONFIGURATION;
}
