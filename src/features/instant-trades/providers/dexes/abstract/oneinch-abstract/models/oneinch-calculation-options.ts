import { MarkRequired } from 'ts-essentials';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';

export type OneinchCalculationOptions = MarkRequired<
    CalculationOptions,
    'slippageTolerance' | 'gasCalculation' | 'disableMultihops' | 'fromAddress' | 'wrappedAddress'
>;
