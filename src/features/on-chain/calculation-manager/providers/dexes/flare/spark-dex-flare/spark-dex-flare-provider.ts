import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SPARK_DEX_FLARE_PROVIDER_CONFIGURATION } from './constants';
import { SparkDexFlareTrade } from './spark-dex-flare-trade';

export class SparkDexFlareProvider extends UniswapV2AbstractProvider<SparkDexFlareTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FLARE;

    public readonly UniswapV2TradeClass = SparkDexFlareTrade;

    public readonly providerSettings = SPARK_DEX_FLARE_PROVIDER_CONFIGURATION;
}
