import { CelerCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-provider';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { LifiCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-provider';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { RangoCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/rango-cross-chain-provider';
import { ViaCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/via-provider/via-cross-chain-provider';
import { BridgersCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/bridgers-cross-chain-provider';
import { BitgertCrossChainProvider } from '../../providers/bitgert-provider/bitgert-cross-chain-provider';

export const CrossChainProviders = [
    CelerCrossChainProvider,
    SymbiosisCrossChainProvider,
    LifiCrossChainProvider,
    DebridgeCrossChainProvider,
    RangoCrossChainProvider,
    ViaCrossChainProvider,
    BridgersCrossChainProvider,
    BitgertCrossChainProvider
] as const;
