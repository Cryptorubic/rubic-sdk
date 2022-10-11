import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OneinchAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/oneinch-abstract-provider';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { AlgebraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-provider';
import { AlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-trade';
import { OneinchTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/oneinch-trade';

export type CelerSupportedOnChainTradeProvider =
    | UniswapV2AbstractProvider
    | OneinchAbstractProvider
    | UniswapV3AbstractProvider
    | AlgebraProvider;

export type CelerSupportedOnChainTrade =
    | UniswapV2AbstractTrade
    | OneinchTrade
    | UniswapV3AbstractTrade
    | AlgebraTrade;
