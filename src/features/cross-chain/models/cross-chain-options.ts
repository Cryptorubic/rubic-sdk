export interface CrossChainOptions {
    fromSlippageTolerance?: number;
    toSlippageTolerance?: number;
    gasCalculation?: 'enabled' | 'disabled';
    providerAddress?: string;
    deadline?: number;
    slippageTolerance?: number;
    fromAddress?: string;
}

export type RequiredCrossChainOptions = Required<CrossChainOptions>;
