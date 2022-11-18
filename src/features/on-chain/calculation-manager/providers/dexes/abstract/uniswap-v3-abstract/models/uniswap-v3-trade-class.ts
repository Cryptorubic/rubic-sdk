import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { AbstractConstructorParameters, Constructor } from 'src/common/utils/types';

export type UniswapV3TradeClass<T> = Constructor<
    AbstractConstructorParameters<typeof UniswapV3AbstractTrade>,
    T
> &
    Omit<typeof UniswapV3AbstractTrade, 'constructor'>;
