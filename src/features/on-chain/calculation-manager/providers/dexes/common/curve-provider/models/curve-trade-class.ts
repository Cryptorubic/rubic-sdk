import { AbstractConstructorParameters, Constructor } from 'src/common/utils/types';
import { CurveAbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-trade';

export type CurveTradeClass<T> = Constructor<
    AbstractConstructorParameters<typeof CurveAbstractTrade>,
    T
> &
    Omit<typeof CurveAbstractTrade, 'constructor'>;
