import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PANGOLIN_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/constants';
import { PangolinTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/pangolin-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class PangolinProvider extends UniswapV2AbstractProvider<PangolinTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly UniswapV2TradeClass = PangolinTrade;

    public readonly providerSettings = PANGOLIN_PROVIDER_CONFIGURATION;
}
