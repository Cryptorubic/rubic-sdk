import { MarkRequired } from 'ts-essentials';
import { LifiBridgeTypes } from '../providers/lifi-provider/models/lifi-bridge-types';
import { RangoBridgeTypes } from '../providers/rango-provider/models/rango-bridge-types';

export interface CrossChainOptions {
    /**
     * Slippage in source network (for Celer and Rubic).
     * Takes value from 0 to 1.
     */
    fromSlippageTolerance?: number;

    /**
     * Slippage in target network (for Celer and Rubic).
     * Takes value from 0 to 1.
     */
    toSlippageTolerance?: number;

    /**
     * Enables or disables gas fee calculation.
     */
    gasCalculation?: 'enabled' | 'disabled';

    /**
     * @internal
     * Integrator address.
     */
    providerAddress?: string;

    /**
     * Deadline for transaction (for Symbiosis).
     */
    deadline?: number;

    /**
     * Overall slippage (for Symbiosis).
     * Takes value from 0 to 1.
     */
    slippageTolerance?: number;

    /**
     * Address to send transaction, otherwise connected wallet is used (necessary for Symbiosis).
     */
    fromAddress?: string;

    /**
     * Address to send transaction, otherwise connected wallet is used (necessary for Symbiosis).
     */
    receiverAddress?: string;

    /**
     * Timeout for each cross-chain provider. Calculation for provider is cancelled, after timeout is passed.
     */
    timeout?: number;

    rangoDisabledBridgeTypes?: RangoBridgeTypes[];

    lifiDisabledBridgeTypes?: LifiBridgeTypes[];
}

export type RequiredCrossChainOptions = MarkRequired<
    CrossChainOptions,
    | 'fromSlippageTolerance'
    | 'toSlippageTolerance'
    | 'slippageTolerance'
    | 'gasCalculation'
    | 'deadline'
    | 'providerAddress'
    | 'timeout'
>;
