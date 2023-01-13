import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/sushi-swap-ethereum/constants';
import { SushiSwapEthereumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-trade';

export class SushiSwapEthereumProvider extends UniswapV2AbstractProvider<SushiSwapEthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly UniswapV2TradeClass = SushiSwapEthereumTrade;

    public readonly providerSettings = SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION;
}
