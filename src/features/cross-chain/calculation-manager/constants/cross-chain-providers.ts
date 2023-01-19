import { BridgersCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/bridgers-cross-chain-provider';
import { CbridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-provider';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';

export const CrossChainProviders = [
    // CelerCrossChainProvider,
    SymbiosisCrossChainProvider,
    // LifiCrossChainProvider,
    DebridgeCrossChainProvider,
    // RangoCrossChainProvider,
    // ViaCrossChainProvider,
    BridgersCrossChainProvider,
    // DexMultichainCrossChainProvider,
    XyCrossChainProvider,
    CbridgeCrossChainProvider
] as const;
