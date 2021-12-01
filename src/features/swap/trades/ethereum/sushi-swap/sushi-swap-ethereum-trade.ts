import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_ETHEREUM_CONTRACT_ADDRESS } from '@features/swap/trades/ethereum/sushi-swap/constants';

export class SushiSwapEthereumTrade extends UniswapV2AbstractTrade {
    protected contractAddress = SUSHI_SWAP_ETHEREUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
