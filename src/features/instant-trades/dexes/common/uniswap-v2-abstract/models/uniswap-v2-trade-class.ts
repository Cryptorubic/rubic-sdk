import { AbstractConstructorParameters } from '@rsdk-common/utils/types/abstract-constructor-parameters';
import { Constructor } from '@rsdk-common/utils/types/constructor';
import { UniswapV2AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export type UniswapV2TradeClass<T> = Constructor<
    AbstractConstructorParameters<typeof UniswapV2AbstractTrade>,
    T
> &
    Omit<typeof UniswapV2AbstractTrade, 'constructor'>;
