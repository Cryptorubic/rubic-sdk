import {
    CrossChainOptions,
    RequiredCrossChainOptions
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { MarkRequired } from 'ts-essentials';

export type CrossChainManagerCalculationOptions = Omit<CrossChainOptions, 'providerAddress'> & {
    /**
     * An array of disabled cross-chain providers.
     */
    readonly disabledProviders?: CrossChainTradeType[];
};

export type RequiredCrossChainManagerCalculationOptions = MarkRequired<
    CrossChainManagerCalculationOptions,
    'disabledProviders'
> &
    RequiredCrossChainOptions;
