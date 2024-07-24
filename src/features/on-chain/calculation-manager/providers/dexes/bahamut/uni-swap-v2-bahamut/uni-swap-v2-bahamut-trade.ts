import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { UNI_SWAP_V2_BAHAMUT_CONTRACT_ADDRESS } from './constants';

export class UniSwapV2BahamutTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.UNISWAP_BAHAMUT;
    }

    public readonly dexContractAddress = UNI_SWAP_V2_BAHAMUT_CONTRACT_ADDRESS;
}
