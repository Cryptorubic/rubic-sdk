import { AbstractConstructorParameters } from '@rsdk-common/utils/types/abstract-constructor-parameters';
import { Constructor } from '@rsdk-common/utils/types/constructor';
import { UniswapV3AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export type UniswapV3TradeClass<T> = Constructor<
    AbstractConstructorParameters<typeof UniswapV3AbstractTrade>,
    T
> &
    Omit<typeof UniswapV3AbstractTrade, 'constructor'>;
