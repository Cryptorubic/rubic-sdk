import { AbstractConstructorParameters } from '@common/utils/types/abstract-constructor-parameters';
import { Constructor } from '@common/utils/types/constructor';
import { UniswapV3AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export type UniswapV3TradeClass<T> = Constructor<
    AbstractConstructorParameters<typeof UniswapV3AbstractTrade>,
    T
> &
    Omit<typeof UniswapV3AbstractTrade, 'constructor'>;
