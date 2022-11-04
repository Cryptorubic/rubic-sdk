import { UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v2-ethereum/constants';
import { UniSwapV2EthereumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class UniSwapV2EthereumProvider extends UniswapV2AbstractProvider<UniSwapV2EthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly UniswapV2TradeClass = UniSwapV2EthereumTrade;

    public readonly providerSettings = UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION;
}
