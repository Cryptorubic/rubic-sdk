import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UniSwapV2EthereumPowTrade } from 'src/features/instant-trades/dexes/ethereum-pow/uni-swap-v2-ethereum-pow/uni-swap-v2-ethereum-pow-trade';
import { UNISWAP_V2_ETHEREUM_POW_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum-pow/uni-swap-v2-ethereum-pow/constants';

export class UniSwapV2EthereumPowProvider extends UniswapV2AbstractProvider<UniSwapV2EthereumPowTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM_POW;

    public readonly InstantTradeClass = UniSwapV2EthereumPowTrade;

    public readonly providerSettings = UNISWAP_V2_ETHEREUM_POW_PROVIDER_CONFIGURATION;
}
