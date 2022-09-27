import { MarkRequired } from 'ts-essentials';
import { OnChainCalculationOptions } from 'src/features/on-chain/providers/models/on-chain-calculation-options';

export type UniswapV3AlgebraCalculationOptions = MarkRequired<
    OnChainCalculationOptions,
    'slippageTolerance' | 'deadlineMinutes' | 'gasCalculation' | 'disableMultihops'
>;
