import { InstantTrade } from 'src/features/instant-trades/instant-trade';
import { UniswapV3AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3AbstractTrade } from 'src/features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { OneinchAbstractProvider } from 'src/features/instant-trades/dexes/common/oneinch-common/oneinch-abstract-provider';
import { AlgebraTrade } from 'src/features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { AlgebraProvider } from 'src/features/instant-trades/dexes/polygon/algebra/algebra-provider';
import { ZrxTrade } from 'src/features/instant-trades/dexes/common/zrx-common/zrx-trade';
import { CrossChainSupportedInstantTradeProvider } from 'src/features/cross-chain/providers/common/celer-rubic/models/cross-chain-supported-instant-trade';
import { UniswapV2AbstractTrade } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OneinchTrade } from 'src/features/instant-trades/dexes/common/oneinch-common/oneinch-trade';

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

export function isUniswapV2LikeProvider(
    provider: CrossChainSupportedInstantTradeProvider
): provider is UniswapV2AbstractProvider {
    return provider instanceof UniswapV2AbstractProvider;
}

export function isUniswapV3LikeProvider(
    provider: CrossChainSupportedInstantTradeProvider
): provider is UniswapV3AbstractProvider {
    return provider instanceof UniswapV3AbstractProvider;
}

export function isOneInchLikeProvider(
    provider: CrossChainSupportedInstantTradeProvider
): provider is OneinchAbstractProvider {
    return provider instanceof OneinchAbstractProvider;
}

export function isAlgebraProvider(
    provider: CrossChainSupportedInstantTradeProvider
): provider is AlgebraProvider {
    return provider instanceof AlgebraProvider;
}

type Indices<L extends number, T extends number[] = []> = T['length'] extends L
    ? T[number]
    : Indices<L, [T['length'], ...T]>;

type LengthAtLeast<T extends readonly unknown[], L extends number> = Pick<Required<T>, Indices<L>>;

export function hasLengthAtLeast<T extends readonly unknown[], L extends number>(
    arr: T,
    len: L
): arr is T & LengthAtLeast<T, L> {
    return arr.length >= len;
}
