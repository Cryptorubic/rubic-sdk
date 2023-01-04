import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { MultichainCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-provider';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';

export const CrossChainProviders = [
    // CelerCrossChainProvider,
    SymbiosisCrossChainProvider,
    // LifiCrossChainProvider,
    DebridgeCrossChainProvider,
    // RangoCrossChainProvider,
    // ViaCrossChainProvider,
    // BridgersCrossChainProvider,
    // DexMultichainCrossChainProvider,
    XyCrossChainProvider,
    // CbridgeCrossChainProvider
    MultichainCrossChainProvider
] as const;
