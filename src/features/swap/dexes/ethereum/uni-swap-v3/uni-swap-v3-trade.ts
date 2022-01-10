import { TRADE_TYPE, TradeType } from 'src/features';
import {
    UniswapV3AbstractTrade,
    UniswapV3TradeStruct
} from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UNI_SWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS } from '@features/swap/dexes/ethereum/uni-swap-v3/constants/swap-router-contract-address';

export class UniSwapV3Trade extends UniswapV3AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.UNISWAP_V3;
    }

    protected readonly contractAddress = UNI_SWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);
    }
}
