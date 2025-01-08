import { ArbitrumRbcBridgeProvider } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/arbitrum-rbc-bridge-provider';
import { ArchonBridgeProvider } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/archon-bridge-provider';
import { BridgersCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/bridgers-cross-chain-provider';
import { CbridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-provider';
import { ChangenowCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/changenow-cross-chain-provider';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { LifiCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-provider';
import { MorphBridgeProvider } from 'src/features/cross-chain/calculation-manager/providers/morph-bridge/morph-bridge-provider';
import { PulseChainCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/pulse-chain-cross-chain-provider';
import { SquidrouterCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/squidrouter-cross-chain-provider';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';

import { AcrossCrossChainProvider } from '../providers/across-provider/across-cross-chain-provider';
import { EddyBridgeProvider } from '../providers/eddy-bridge/eddy-bridge-provider';
import { LayerZeroBridgeProvider } from '../providers/layerzero-bridge/layerzero-bridge-provider';
import { MesonCrossChainProvider } from '../providers/meson-provider/meson-cross-chain-provider';
import { OrbiterBridgeProvider } from '../providers/orbiter-bridge/orbiter-bridge-provider';
import { OwlToBridgeProvider } from '../providers/owl-to-bridge/owl-to-bridge-provider';
import { RangoCrossChainProvider } from '../providers/rango-provider/rango-cross-chain-provider';
import { RetroBridgeProvider } from '../providers/retro-bridge/retro-bridge-provider';
import { RouterCrossChainProvider } from '../providers/router-provider/router-cross-chain-provider';
import { StargateV2CrossChainProvider } from '../providers/stargate-v2-provider/stargate-v2-cross-chain-provider';
import { TaikoBridgeProvider } from '../providers/taiko-bridge/taiko-bridge-provider';
import { UniZenCcrProvider } from '../providers/unizen-provider/unizen-ccr-provider';

const proxyProviders = [
    SymbiosisCrossChainProvider,
    StargateV2CrossChainProvider,
    XyCrossChainProvider,
    CbridgeCrossChainProvider,
    LifiCrossChainProvider,
    SquidrouterCrossChainProvider,
    RangoCrossChainProvider,
    PulseChainCrossChainProvider,
    OrbiterBridgeProvider,
    ArchonBridgeProvider,
    MesonCrossChainProvider,
    OwlToBridgeProvider,
    EddyBridgeProvider,
    RouterCrossChainProvider,
    RetroBridgeProvider,
    AcrossCrossChainProvider,
    UniZenCcrProvider,
    MorphBridgeProvider
] as const;

const nonProxyProviders = [
    DebridgeCrossChainProvider,
    BridgersCrossChainProvider,
    ChangenowCrossChainProvider,
    ArbitrumRbcBridgeProvider,
    TaikoBridgeProvider,
    LayerZeroBridgeProvider
    // SimpleSwapCcrProvider
    // MorphBridgeProvider
] as const;

export const CrossChainProviders = [...proxyProviders, ...nonProxyProviders] as const;
