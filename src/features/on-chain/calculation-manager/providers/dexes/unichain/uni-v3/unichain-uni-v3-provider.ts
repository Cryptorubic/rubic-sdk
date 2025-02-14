import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV3AbstractProvider } from '../../common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UnichainUniswapV3QuoterController } from '../../common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-unichain-quoter-controller';
import { UNI_SWAP_V3_UNICHAIN_PROVIDER_CONFIGURATION } from './constants/provider-configuration';
import { UNI_SWAP_V3_UNICHAIN_ROUTER_CONFIGURATION } from './constants/router-configuration';
import { UniswapV3UnichainTrade } from './unichain-uni-v3-trade';

export class UniSwapV3UnichainProvider extends UniswapV3AbstractProvider<UniswapV3UnichainTrade> {
    public readonly blockchain: EvmBlockchainName = BLOCKCHAIN_NAME.UNICHAIN;

    protected readonly OnChainTradeClass = UniswapV3UnichainTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_UNICHAIN_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_UNICHAIN_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UnichainUniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration
    );
}
