import { AVAX_ABI } from '@features/swap/trades/avalanche/avax-abi';
import { JOE_CONTRACT_ADDRESS } from '@features/swap/trades/avalanche/joe-trade/constants';
import { AVALANCHE_SWAP_METHOD } from '@features/swap/trades/avalanche/swap-methods';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';

export class JoeTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = AVAX_ABI;

    public static readonly swapMethods = AVALANCHE_SWAP_METHOD;

    protected contractAddress = JOE_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
