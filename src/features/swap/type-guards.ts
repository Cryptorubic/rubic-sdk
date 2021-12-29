import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OneinchTrade } from '@features/swap/dexes/common/oneinch-common/oneinch-trade';
import { ZrxTrade } from '@features/swap/dexes/common/zrx-common/zrx-trade';
import { UniSwapV3Trade } from '@features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-trade';
import { InstantTrade } from '@features/swap/instant-trade';

export function isUniswapV2LikeTrade(trade: InstantTrade): trade is UniswapV2AbstractTrade {
    return trade instanceof UniswapV2AbstractTrade;
}

export function isUniswapV3LikeTrade(trade: InstantTrade): trade is UniSwapV3Trade {
    return trade instanceof UniSwapV3Trade;
}

export function isOneInchLikeTrade(trade: InstantTrade): trade is OneinchTrade {
    return trade instanceof OneinchTrade;
}

export function isZrxLikeTradeLikeTrade(trade: InstantTrade): trade is ZrxTrade {
    return trade instanceof ZrxTrade;
}
