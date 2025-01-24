import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { FRAXSWAP_V2_CONTRACT_ADDRESS } from './constants';

export class FraxSwapV2Trade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FRAX_SWAP_V2;
    }

    public readonly dexContractAddress = FRAXSWAP_V2_CONTRACT_ADDRESS;
}
