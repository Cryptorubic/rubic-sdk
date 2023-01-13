import { CelerSupportedOnChainTradeProvider } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-supported-on-chain-trade';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { OneinchAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/oneinch-abstract-provider';
import { OneinchTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/oneinch-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { ZrxTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/zrx-trade';
import { AlgebraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-provider';
import { AlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-trade';

export function isUniswapV2LikeTrade(trade: OnChainTrade): trade is UniswapV2AbstractTrade {
    return trade instanceof UniswapV2AbstractTrade;
}

export function isUniswapV3LikeTrade(trade: OnChainTrade): trade is UniswapV3AbstractTrade {
    return trade instanceof UniswapV3AbstractTrade;
}

export function isOneInchLikeTrade(trade: OnChainTrade): trade is OneinchTrade {
    return trade instanceof OneinchTrade;
}

export function isZrxLikeTradeLikeTrade(trade: OnChainTrade): trade is ZrxTrade {
    return trade instanceof ZrxTrade;
}

export function isAlgebraTrade(trade: OnChainTrade): trade is AlgebraTrade {
    return trade instanceof AlgebraTrade;
}

export function isUniswapV2LikeProvider(
    provider: CelerSupportedOnChainTradeProvider
): provider is UniswapV2AbstractProvider {
    return provider instanceof UniswapV2AbstractProvider;
}

export function isUniswapV3LikeProvider(
    provider: CelerSupportedOnChainTradeProvider
): provider is UniswapV3AbstractProvider {
    return provider instanceof UniswapV3AbstractProvider;
}

export function isOneInchLikeProvider(
    provider: CelerSupportedOnChainTradeProvider
): provider is OneinchAbstractProvider {
    return provider instanceof OneinchAbstractProvider;
}

export function isAlgebraProvider(
    provider: CelerSupportedOnChainTradeProvider
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
