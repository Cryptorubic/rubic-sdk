import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { UNI_SWAP_V3_ETHEREUM_POW_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/constants/provider-configuration';
import { UNI_SWAP_V3_ETHEREUM_POW_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/constants/router-configuration';
import { UniSwapV3EthereumPowTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/uni-swap-v3-ethereum-pow-trade';

export class UniSwapV3EthereumPowProvider extends UniswapV3AbstractProvider<UniSwapV3EthereumPowTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM_POW;

    public readonly OnChainTradeClass = UniSwapV3EthereumPowTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_ETHEREUM_POW_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_ETHEREUM_POW_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration
    );
}
