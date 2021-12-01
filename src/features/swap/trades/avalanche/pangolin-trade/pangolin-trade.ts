import { AVAX_ABI } from '@features/swap/trades/avalanche/avax-abi';
import { PANGOLIN_CONTRACT_ADDRESS } from '@features/swap/trades/avalanche/pangolin-trade/constants';
import { AVALANCHE_SWAP_METHOD } from '@features/swap/trades/avalanche/swap-methods';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';

export class PangolinTrade extends UniswapV2AbstractTrade {
    protected contractAddress = PANGOLIN_CONTRACT_ADDRESS;

    protected contractAbi = AVAX_ABI;

    protected readonly swapMethods = AVALANCHE_SWAP_METHOD;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
