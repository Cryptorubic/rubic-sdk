import { BridgersCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/bridgers-cross-chain-provider';
import { CelerCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-provider';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { LifiCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-provider';
import { DexMultichainCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/dex-multichain-cross-chain-provider';
import { RangoCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/rango-cross-chain-provider';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { ViaCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/via-provider/via-cross-chain-provider';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';

import { StargateCrossChainProvider } from '../providers/stargate-provider/stargate-cross-chain-provider';

export const CrossChainProviders = [
    CelerCrossChainProvider,
    SymbiosisCrossChainProvider,
    LifiCrossChainProvider,
    DebridgeCrossChainProvider,
    RangoCrossChainProvider,
    ViaCrossChainProvider,
    BridgersCrossChainProvider,
    DexMultichainCrossChainProvider,
    XyCrossChainProvider,
    StargateCrossChainProvider
] as const;
