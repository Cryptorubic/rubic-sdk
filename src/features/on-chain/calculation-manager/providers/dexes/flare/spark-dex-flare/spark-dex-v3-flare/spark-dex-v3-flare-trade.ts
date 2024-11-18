import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from '../../../../common/models/on-chain-trade-type';
import { UniswapV3AbstractTrade } from '../../../common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import {
    SPARK_DEX_V3_FLARE_SWAP_ROUTER_ABI,
    SPARK_DEX_V3_FLARE_SWAP_ROUTER_CONTRACT
} from './constants/spark-dex-v3-flare-contract-abi';

export class SparkDexV3FlareTrade extends UniswapV3AbstractTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SPARK_DEX_V3;
    }

    public readonly dexContractAddress = SPARK_DEX_V3_FLARE_SWAP_ROUTER_CONTRACT;

    protected readonly contractAbi = SPARK_DEX_V3_FLARE_SWAP_ROUTER_ABI;
}
