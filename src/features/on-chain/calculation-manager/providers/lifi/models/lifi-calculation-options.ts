import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { MarkRequired } from 'ts-essentials';

export type LifiCalculationOptions = OnChainCalculationOptions & {
    readonly gasCalculation?: 'disabled' | 'calculate';
    readonly disabledProviders: OnChainTradeType[];
};

export type RequiredLifiCalculationOptions = MarkRequired<
    RequiredOnChainCalculationOptions & LifiCalculationOptions,
    'gasCalculation'
>;
