import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_ETHEREUM_POW_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v2-ethereum-pow/constants';
import { UniSwapV2EthereumPowTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v2-ethereum-pow/uni-swap-v2-ethereum-pow-trade';

export class UniSwapV2EthereumPowProvider extends UniswapV2AbstractProvider<UniSwapV2EthereumPowTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM_POW;

    public readonly UniswapV2TradeClass = UniSwapV2EthereumPowTrade;

    public readonly providerSettings = UNISWAP_V2_ETHEREUM_POW_PROVIDER_CONFIGURATION;
}
