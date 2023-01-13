import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v3-ethereum/constants/provider-configuration';
import { UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v3-ethereum/constants/router-configuration';
import { UniSwapV3EthereumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-trade';

export class UniSwapV3EthereumProvider extends UniswapV3AbstractProvider<UniSwapV3EthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly OnChainTradeClass = UniSwapV3EthereumTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION;
}
