import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { DexMultichainCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/dex-multichain-cross-chain-provider';
import { StargateCrossChainProvider } from '../providers/stargate-provider/stargate-cross-chain-provider';

export const CrossChainProviders = [
    // CelerCrossChainProvider,
    SymbiosisCrossChainProvider,
    // LifiCrossChainProvider,
    // DebridgeCrossChainProvider,
    // RangoCrossChainProvider,
    // ViaCrossChainProvider,
    // BridgersCrossChainProvider,
    DexMultichainCrossChainProvider,
    // XyCrossChainProvider,
    // CbridgeCrossChainProvider,
    StargateCrossChainProvider
] as const;
