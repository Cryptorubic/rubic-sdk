import { MarkRequired } from 'ts-essentials';
import { OnChainCalculationOptions } from 'src/features/on-chain/providers/models/on-chain-calculation-options';

export type OneinchCalculationOptions = MarkRequired<
    OnChainCalculationOptions,
    'slippageTolerance' | 'gasCalculation' | 'disableMultihops' | 'fromAddress' | 'wrappedAddress'
>;
