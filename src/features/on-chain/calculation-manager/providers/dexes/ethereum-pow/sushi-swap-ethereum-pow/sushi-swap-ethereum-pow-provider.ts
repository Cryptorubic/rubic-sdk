import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_ETHEREUM_POW_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/sushi-swap-ethereum-pow/constants';
import { SushiSwapEthereumPowTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/sushi-swap-ethereum-pow/sushi-swap-ethereum-pow-trade';

export class SushiSwapEthereumPowProvider extends UniswapV2AbstractProvider<SushiSwapEthereumPowTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM_POW;

    public readonly UniswapV2TradeClass = SushiSwapEthereumPowTrade;

    public readonly providerSettings = SUSHI_SWAP_ETHEREUM_POW_PROVIDER_CONFIGURATION;
}
