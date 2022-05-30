export interface CrossChainOptions {
    fromSlippageTolerance: number;
    toSlippageTolerance: number;
    gasCalculation: 'enabled' | 'disabled';
    providerAddress: string;
}
