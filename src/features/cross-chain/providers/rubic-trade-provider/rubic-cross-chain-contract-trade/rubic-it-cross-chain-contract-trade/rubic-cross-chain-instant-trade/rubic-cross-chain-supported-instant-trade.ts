import {
    OneinchAbstractProvider,
    OneinchTrade,
    UniswapV2AbstractProvider,
    UniswapV2AbstractTrade
} from 'src/features';
import { UniswapV3AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { AlgebraTrade } from '@features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { UniswapV3AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { AlgebraProvider } from '@features/instant-trades/dexes/polygon/algebra/algebra-provider';

export type RubicCrossChainSupportedInstantTradeProvider =
    | UniswapV2AbstractProvider
    | OneinchAbstractProvider
    | UniswapV3AbstractProvider
    | AlgebraProvider;

export type RubicCrossChainSupportedInstantTrade =
    | UniswapV2AbstractTrade
    | OneinchTrade
    | UniswapV3AbstractTrade
    | AlgebraTrade;
