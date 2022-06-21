export interface SwapOptions {
    /**
     * Takes value from 0 to 1.
     */
    readonly slippageTolerance?: number;

    /**
     * Transaction deadline, passed in minutes.
     */
    readonly deadlineMinutes?: number;
}
