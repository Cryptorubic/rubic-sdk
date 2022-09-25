import { MarkRequired } from 'ts-essentials';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';

export type UniswapV2CalculationOptions = MarkRequired<
    CalculationOptions,
    'slippageTolerance' | 'deadlineMinutes' | 'gasCalculation' | 'disableMultihops'
>;
