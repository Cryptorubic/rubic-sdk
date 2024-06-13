import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_ZETACHAIN_CONTRACT_ADDRESS } from './constants';

export class SushiSwapZetachainTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SUSHI_SWAP;
    }

    public readonly dexContractAddress = SUSHI_SWAP_ZETACHAIN_CONTRACT_ADDRESS;
}
