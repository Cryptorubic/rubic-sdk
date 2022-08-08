import {
    OneinchAbstractProvider,
    OneinchTrade,
    UniswapV2AbstractProvider,
    UniswapV2AbstractTrade
} from 'src/features';
import { UniswapV3AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { AlgebraTrade } from '@rsdk-features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { UniswapV3AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { AlgebraProvider } from '@rsdk-features/instant-trades/dexes/polygon/algebra/algebra-provider';

export type CrossChainSupportedInstantTradeProvider =
    | UniswapV2AbstractProvider
    | OneinchAbstractProvider
    | UniswapV3AbstractProvider
    | AlgebraProvider;

export type CrossChainSupportedInstantTrade =
    | UniswapV2AbstractTrade
    | OneinchTrade
    | UniswapV3AbstractTrade
    | AlgebraTrade;
