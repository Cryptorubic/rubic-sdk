import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';

export const providerDefaultOptions: Omit<
    RequiredOnChainCalculationOptions,
    'gasCalculation' | 'providerAddress'
> = {
    slippageTolerance: 0.02,
    useProxy: false,
    withDeflation: {
        from: { isDeflation: false },
        to: { isDeflation: false }
    }
};
