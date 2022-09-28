import {
    UniswapV3AbstractTrade,
    UniswapV3TradeStruct
} from 'src/features/on-chain/providers/dexes/abstract/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export class UniSwapV3EthereumTrade extends UniswapV3AbstractTrade {
    constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);
    }
}
