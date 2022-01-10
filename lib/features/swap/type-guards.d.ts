import { UniswapV2AbstractTrade } from './dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OneinchTrade } from './dexes/common/oneinch-common/oneinch-trade';
import { ZrxTrade } from './dexes/common/zrx-common/zrx-trade';
import { UniSwapV3Trade } from './dexes/ethereum/uni-swap-v3/uni-swap-v3-trade';
import { InstantTrade } from './instant-trade';
export declare function isUniswapV2LikeTrade(trade: InstantTrade): trade is UniswapV2AbstractTrade;
export declare function isUniswapV3LikeTrade(trade: InstantTrade): trade is UniSwapV3Trade;
export declare function isOneInchLikeTrade(trade: InstantTrade): trade is OneinchTrade;
export declare function isZrxLikeTradeLikeTrade(trade: InstantTrade): trade is ZrxTrade;
