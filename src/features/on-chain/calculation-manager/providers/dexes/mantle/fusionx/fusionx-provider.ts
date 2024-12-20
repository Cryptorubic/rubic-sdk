import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { FusionXUniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/fusionx-uniswap-v3-quoter-controller';
import { FUSIONX_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/fusionx/constants/provider-configuration';
import { FUSIONX_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/fusionx/constants/router-configuration';
import { FusionXTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/fusionx/fusionx-trade';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';

export class FusionXProvider extends UniswapV3AbstractProvider<FusionXTrade> {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FUSIONX;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.MANTLE;

    public readonly OnChainTradeClass = FusionXTrade;

    public readonly providerConfiguration = FUSIONX_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = FUSIONX_ROUTER_CONFIGURATION;

    protected readonly quoterController = new FusionXUniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration
    );
}
