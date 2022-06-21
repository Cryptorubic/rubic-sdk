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
}

export type RequiredCrossChainOptions = Required<CrossChainOptions>;
