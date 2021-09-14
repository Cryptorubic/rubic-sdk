export interface SwapOptions {
    shouldCalculateGas: boolean;
    slippageTolerance: number;
    deadline: number;
    disableMultihops: boolean;
    rubicOptimisation: boolean;
}
