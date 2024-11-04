import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { BLAZE_SWAP_FLARE_CONTRACT_ADDRESS } from './constants';

export class BlazeSwapFlareTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BLAZE_SWAP;
    }

    public readonly dexContractAddress = BLAZE_SWAP_FLARE_CONTRACT_ADDRESS;
}
