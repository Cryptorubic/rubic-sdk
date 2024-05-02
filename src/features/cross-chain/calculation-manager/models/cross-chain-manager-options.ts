import {
    CrossChainOptions,
    RequiredCrossChainOptions
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { LifiSubProvider } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-bridge-types';
import { MarkRequired } from 'ts-essentials';

export type CrossChainManagerCalculationOptions = CrossChainOptions & {
    /**
     * An array of disabled cross-chain providers.
     */
    readonly disabledProviders?: CrossChainTradeType[];

    /**
     * @deprecated Will be renamed to `lifiDisabledProviders` in the next major update
     */
    readonly lifiDisabledBridgeTypes?: LifiSubProvider[];
};

export type RequiredCrossChainManagerCalculationOptions = MarkRequired<
    CrossChainManagerCalculationOptions,
    'disabledProviders'
> &
    RequiredCrossChainOptions;
