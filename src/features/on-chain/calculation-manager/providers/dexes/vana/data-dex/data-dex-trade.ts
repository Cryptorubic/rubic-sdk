import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV3AbstractTrade } from '../../common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { DATA_DEX_ROUTER_CONTRACT_ADDRESS } from './constants/provider-config';

export class DataDexTrade extends UniswapV3AbstractTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.DATA_DEX;
    }

    public readonly dexContractAddress = DATA_DEX_ROUTER_CONTRACT_ADDRESS;
}
