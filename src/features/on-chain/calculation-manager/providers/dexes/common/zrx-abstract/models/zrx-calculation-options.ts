import { MarkRequired } from 'ts-essentials';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';

export type ZrxCalculationOptions = MarkRequired<
    OnChainCalculationOptions,
    'slippageTolerance' | 'gasCalculation'
>;
