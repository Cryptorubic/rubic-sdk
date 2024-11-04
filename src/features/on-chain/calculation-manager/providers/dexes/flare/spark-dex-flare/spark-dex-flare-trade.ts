import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SPARK_DEX_FLARE_CONTRACT_ADDRESS } from './constants';

export class SparkDexFlareTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SPARK_DEX;
    }

    public readonly dexContractAddress = SPARK_DEX_FLARE_CONTRACT_ADDRESS;
}
