import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/constants';
import { UniSwapV2EthereumTrade } from '@rsdk-features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-trade';

export class UniSwapV2EthereumProvider extends UniswapV2AbstractProvider<UniSwapV2EthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly InstantTradeClass = UniSwapV2EthereumTrade;

    public readonly providerSettings = UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION;
}
