import { UniswapV2AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OneinchTrade } from '@features/instant-trades/dexes/common/oneinch-common/oneinch-trade';
import { ZrxTrade } from '@features/instant-trades/dexes/common/zrx-common/zrx-trade';
import { InstantTrade } from '@features/instant-trades/instant-trade';
import { UniswapV3AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { AlgebraTrade } from '@features/instant-trades/dexes/polygon/algebra/algebra-trade';

export function isUniswapV2LikeTrade(trade: InstantTrade): trade is UniswapV2AbstractTrade {
    return trade instanceof UniswapV2AbstractTrade;
}

export function isUniswapV3LikeTrade(trade: InstantTrade): trade is UniswapV3AbstractTrade {
    return trade instanceof UniswapV3AbstractTrade;
}

export function isOneInchLikeTrade(trade: InstantTrade): trade is OneinchTrade {
    return trade instanceof OneinchTrade;
}

export function isZrxLikeTradeLikeTrade(trade: InstantTrade): trade is ZrxTrade {
    return trade instanceof ZrxTrade;
}

export function isAlgebraTrade(trade: InstantTrade): trade is AlgebraTrade {
    return trade instanceof AlgebraTrade;
}
