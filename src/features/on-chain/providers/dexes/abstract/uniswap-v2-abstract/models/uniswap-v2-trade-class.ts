import { UniswapV2AbstractTrade } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { AbstractConstructorParameters, Constructor } from 'src/common/utils/types';

export type UniswapV2TradeClass<T> = Constructor<
    AbstractConstructorParameters<typeof UniswapV2AbstractTrade>,
    T
> &
    Omit<typeof UniswapV2AbstractTrade, 'constructor'>;
