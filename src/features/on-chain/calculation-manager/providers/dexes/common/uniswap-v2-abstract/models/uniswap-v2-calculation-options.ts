import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { MarkRequired } from 'ts-essentials';

export type UniswapV2CalculationOptions = MarkRequired<
    RequiredOnChainCalculationOptions,
    'deadlineMinutes' | 'disableMultihops'
>;
