import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { MarkRequired } from 'ts-essentials';

export type UniswapV3AlgebraCalculationOptions = MarkRequired<
    RequiredOnChainCalculationOptions,
    'deadlineMinutes' | 'disableMultihops'
>;
