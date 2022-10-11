import { RequiredCrossChainManagerCalculationOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-manager-options';

export const defaultCrossChainCalculationOptions: Omit<
    RequiredCrossChainManagerCalculationOptions,
    'providerAddress'
> = {
    fromSlippageTolerance: 0.02,
    toSlippageTolerance: 0.02,
    gasCalculation: 'disabled',
    disabledProviders: [],
    timeout: 25_000,
    slippageTolerance: 0.04,
    deadline: 20
};
