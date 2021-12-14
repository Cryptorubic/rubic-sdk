import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_ETHEREUM_CONTRACT_ADDRESS } from '@features/swap/dexes/ethereum/sushi-swap-ethereum/constants';

export class SushiSwapEthereumTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SUSHI_SWAP_ETHEREUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
