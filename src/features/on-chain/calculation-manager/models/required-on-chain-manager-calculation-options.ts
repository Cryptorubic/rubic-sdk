import { OnChainManagerCalculationOptions } from 'src/features/on-chain/calculation-manager/models/on-chain-manager-calculation-options';
import { MarkRequired } from 'ts-essentials';

export type RequiredOnChainManagerCalculationOptions = MarkRequired<
    OnChainManagerCalculationOptions,
    'timeout' | 'disabledProviders' | 'providerAddress' | 'useProxy' | 'withDeflation'
>;
