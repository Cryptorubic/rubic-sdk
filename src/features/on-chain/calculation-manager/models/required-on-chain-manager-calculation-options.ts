import { MarkRequired } from 'ts-essentials';
import { OnChainManagerCalculationOptions } from 'src/features/on-chain/calculation-manager/models/on-chain-manager-calculation-options';

export type RequiredOnChainManagerCalculationOptions = MarkRequired<
    OnChainManagerCalculationOptions,
    | 'timeout'
    | 'disabledProviders'
    | 'providerAddress'
    | 'useProxy'
    | 'isDeflationFrom'
    | 'isDeflationTo'
>;
