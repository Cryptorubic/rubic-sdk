import { CbridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-provider';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { LifiCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-provider';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';
import { ChaingeCrossChainProvider } from '../providers/chainge-provider/chainge-cross-chain-provider';

export const CrossChainProviders = [
    // CelerCrossChainProvider,
    SymbiosisCrossChainProvider,
    LifiCrossChainProvider,
    DebridgeCrossChainProvider,
    // RangoCrossChainProvider,
    // ViaCrossChainProvider,
    // BridgersCrossChainProvider,
    // DexMultichainCrossChainProvider,
    XyCrossChainProvider,
    CbridgeCrossChainProvider,
    ChaingeCrossChainProvider
] as const;
