import { UniswapV3AbstractTrade } from 'src/features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { AlgebraTrade } from 'src/features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { UniswapV3AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { AlgebraProvider } from 'src/features/instant-trades/dexes/polygon/algebra/algebra-provider';
import { UniswapV2AbstractTrade } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OneinchAbstractProvider } from 'src/features/instant-trades/dexes/common/oneinch-common/oneinch-abstract-provider';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { OneinchTrade } from 'src/features/instant-trades/dexes/common/oneinch-common/oneinch-trade';

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
