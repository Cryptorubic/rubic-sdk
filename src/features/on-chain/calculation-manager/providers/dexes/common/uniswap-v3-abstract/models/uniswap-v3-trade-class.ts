import { AbstractConstructorParameters, Constructor } from 'src/common/utils/types';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export type UniswapV3TradeClass<T> = Constructor<
    AbstractConstructorParameters<typeof UniswapV3AbstractTrade>,
    T
> &
    Omit<typeof UniswapV3AbstractTrade, 'constructor'>;
