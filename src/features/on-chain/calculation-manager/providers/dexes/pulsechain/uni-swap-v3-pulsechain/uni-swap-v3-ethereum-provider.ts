import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { UNI_SWAP_V3_PULSECHAIN_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/uni-swap-v3-pulsechain/constants/provider-configuration';
import { UNI_SWAP_V3_PULSECHAIN_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/uni-swap-v3-pulsechain/constants/router-configuration';
import { UniSwapV3PulsechainTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/uni-swap-v3-pulsechain/uni-swap-v3-ethereum-trade';

export class UniSwapV3PulsechainProvider extends UniswapV3AbstractProvider<UniSwapV3PulsechainTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    public readonly OnChainTradeClass = UniSwapV3PulsechainTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_PULSECHAIN_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_PULSECHAIN_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration
    );
}
