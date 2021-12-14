import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_ETHEREUM_CONTRACT_ADDRESS } from '@features/swap/dexes/ethereum/sushi-swap-ethereum/constants';
import { TRADE_TYPE } from '@features/swap/models/trade-type';

export class SushiSwapEthereumTrade extends UniswapV2AbstractTrade {
    public readonly tradeType = TRADE_TYPE.SUSHI_SWAP_ETHEREUM;

    protected readonly contractAddress = SUSHI_SWAP_ETHEREUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
