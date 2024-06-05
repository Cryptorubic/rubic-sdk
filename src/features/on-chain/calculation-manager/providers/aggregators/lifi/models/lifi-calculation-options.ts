import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { MarkRequired } from 'ts-essentials';

import { OnChainTradeType } from '../../../common/models/on-chain-trade-type';

export interface LifiCalculationOptions extends RequiredOnChainCalculationOptions {
    readonly disabledProviders: OnChainTradeType[];
}

export type RequiredLifiCalculationOptions = MarkRequired<
    RequiredOnChainCalculationOptions & LifiCalculationOptions,
    'gasCalculation'
>;
