export interface SwapOptions {
    readonly gasCalculation: 'disabled' | 'calculate' | 'rubicOptimisation';
    readonly slippageTolerance: number;
    readonly deadline: number;
    readonly disableMultihops: boolean;
}
