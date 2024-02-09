import { ArbitrumRbcBridgeProvider } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/arbitrum-rbc-bridge-provider';
import { BridgersCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/bridgers-cross-chain-provider';
import { CbridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-provider';
import { ChangenowCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/changenow-cross-chain-provider';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { LifiCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-provider';
import { PulseChainCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/pulse-chain-cross-chain-provider';
// import { ScrollBridgeProvider } from 'src/features/cross-chain/calculation-manager/providers/scroll-bridge/scroll-bridge-provider';
import { SquidrouterCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/squidrouter-cross-chain-provider';
import { SymbiosisCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-provider';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';

import { LayerZeroBridgeProvider } from '../providers/layerzero-bridge/layerzero-bridge-provider';
import { RangoCrossChainProvider } from '../providers/rango-provider/rango-cross-chain-provider';
import { StargateCrossChainProvider } from '../providers/stargate-provider/stargate-cross-chain-provider';
import { TaikoBridgeProvider } from '../providers/taiko-bridge/taiko-bridge-provider';

const proxyProviders = [
    SymbiosisCrossChainProvider,
    StargateCrossChainProvider,
    XyCrossChainProvider,
    CbridgeCrossChainProvider,
    LifiCrossChainProvider,
    SquidrouterCrossChainProvider,
    RangoCrossChainProvider,
    PulseChainCrossChainProvider
] as const;

const nonProxyProviders = [
    DebridgeCrossChainProvider,
    BridgersCrossChainProvider,
    ChangenowCrossChainProvider,
    ArbitrumRbcBridgeProvider,
    TaikoBridgeProvider,
    LayerZeroBridgeProvider
    // ScrollBridgeProvider
] as const;

export const CrossChainProviders = [...proxyProviders, ...nonProxyProviders] as const;
