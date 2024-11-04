import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { ENOSYS_FLARE_CONTRACT_ADDRESS } from './constants';

export class EnosysFlareTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ENOSYS;
    }

    public readonly dexContractAddress = ENOSYS_FLARE_CONTRACT_ADDRESS;
}
