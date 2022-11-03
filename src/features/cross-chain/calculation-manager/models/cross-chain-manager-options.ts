import {
    CrossChainOptions,
    RequiredCrossChainOptions
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { MarkRequired } from 'ts-essentials';
import { RangoBridgeTypes } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/models/rango-bridge-types';
import { LifiBridgeTypes } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-bridge-types';

export type CrossChainManagerCalculationOptions = Omit<CrossChainOptions, 'providerAddress'> & {
    /**
     * An array of disabled cross-chain providers.
     */
    readonly disabledProviders?: CrossChainTradeType[];

    readonly lifiDisabledBridgeTypes?: LifiBridgeTypes[];

    readonly rangoDisabledBridgeTypes?: RangoBridgeTypes[];
};

export type RequiredCrossChainManagerCalculationOptions = MarkRequired<
    CrossChainManagerCalculationOptions,
    'disabledProviders'
> &
    RequiredCrossChainOptions;
