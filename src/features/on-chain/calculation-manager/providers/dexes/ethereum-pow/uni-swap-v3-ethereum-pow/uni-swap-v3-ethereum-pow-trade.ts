import {
    UniswapV3AbstractTrade,
    UniswapV3TradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export class UniSwapV3EthereumPowTrade extends UniswapV3AbstractTrade {
    constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);
    }
}
