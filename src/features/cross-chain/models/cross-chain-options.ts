import { MarkRequired } from 'ts-essentials';

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
     * Timeout for each cross chain provider. Calculation for provider is cancelled, after timeout is passed.
     */
    readonly timeout?: number;
}

export type RequiredCrossChainOptions = MarkRequired<
    CrossChainOptions,
    | 'fromSlippageTolerance'
    | 'toSlippageTolerance'
    | 'slippageTolerance'
    | 'deadline'
    | 'providerAddress'
    | 'timeout'
>;
