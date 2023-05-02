import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PANGOLIN_FUJI_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/fuji/pangolin-fuji/constants';
import { PangolinFujiTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/fuji/pangolin-fuji/pangolin-fuji-trade';

export class PangolinFujiProvider extends UniswapV2AbstractProvider<PangolinFujiTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FUJI;

    public readonly UniswapV2TradeClass = PangolinFujiTrade;

    public readonly providerSettings = PANGOLIN_FUJI_PROVIDER_CONFIGURATION;
}
