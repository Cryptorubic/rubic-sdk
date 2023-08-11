import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UNI_SWAP_V3_ARBITRUM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/uni-swap-v3-arbitrum/constants/provider-configuration';
import { UNI_SWAP_V3_ARBITRUM_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/uni-swap-v3-arbitrum/constants/router-configuration';
import { UniSwapV3ArbitrumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-trade';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';

export class UniSwapV3ArbitrumProvider extends UniswapV3AbstractProvider<UniSwapV3ArbitrumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ARBITRUM;

    protected readonly OnChainTradeClass = UniSwapV3ArbitrumTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_ARBITRUM_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_ARBITRUM_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration
    );
}
