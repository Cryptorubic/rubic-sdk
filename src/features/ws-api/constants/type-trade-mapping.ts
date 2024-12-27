// import { CrossChainTradeType } from '@cryptorubic/core';
// import { AbstractConstructorParameters } from 'src/common/utils/types';
// import { AcrossCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/across-provider/across-cross-chain-trade';
// import { ArbitrumRbcBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/arbitrum-rbc-bridge-trade';
// import { ArchonBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/archon-bridge-trade';
// import { CbridgeCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-trade';
// import { ChangenowCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/changenow-cross-chain-trade';
// import { DebridgeCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-factory';
// import { EddyBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/eddy-bridge-trade';
// import { LayerZeroBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/layerzero-bridge/layerzero-bridge-trade';
// import { LifiCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-factory';
// import { MesonCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/meson-cross-chain-factory';
// import { OrbiterBridgeFactory } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/orbiter-bridge-factory';
// import { OwlToBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/owl-to-bridge/owl-to-bridge-trade';
// import { PulseChainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/pulse-chain-cross-chain-trade';
// import { RangoCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/rango-cross-chain-factory';
// import { RetroBridgeFactory } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/retro-bridge-factory';
// import { RouterCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/router-provider/router-cross-chain-factory';
// import { ScrollBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/scroll-bridge/scroll-bridge-trade';
// import { SimpleSwapCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/simple-swap-provider/simple-swap-ccr-trade';
// import { SquidrouterCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/squidrouter-cross-chain-trade';
// import { StargateCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/stargate-cross-chain-trade';
// import { StargateV2CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/stargate-v2-provider/stargate-v2-cross-chain-trade';
// import { SymbiosisCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-factory';
// import { TaikoBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/taiko-bridge/taiko-bridge-trade';
// import { UniZenCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/unizen-provider/unizen-ccr-trade';
// import { XyCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-trade';
export const testMap = {};
// const map = {
//     across: (...args: AbstractConstructorParameters<typeof AcrossCrossChainTrade>) =>
//         new AcrossCrossChainTrade(...args),
//     arbitrum: (...args: AbstractConstructorParameters<typeof ArbitrumRbcBridgeTrade>) =>
//         new ArbitrumRbcBridgeTrade(...args),
//     archon_bridge: (...args: AbstractConstructorParameters<typeof ArchonBridgeTrade>) =>
//         new ArchonBridgeTrade(...args),
//     bridgers: (...args: AbstractConstructorParameters<typeof ArchonBridgeTrade>) =>
//         new ArchonBridgeTrade(...args),
//     celer_bridge: (...args: AbstractConstructorParameters<typeof CbridgeCrossChainTrade>) =>
//         new CbridgeCrossChainTrade(...args),
//     changenow: (...args: AbstractConstructorParameters<typeof ChangenowCrossChainTrade>) =>
//         new ChangenowCrossChainTrade(...args),
//     dln: DebridgeCrossChainFactory.createTrade,
//     eddy_bridge: (...args: AbstractConstructorParameters<typeof EddyBridgeTrade>) =>
//         new EddyBridgeTrade(...args),
//     layerzero: (...args: AbstractConstructorParameters<typeof LayerZeroBridgeTrade>) =>
//         new LayerZeroBridgeTrade(...args),
//     lifi: LifiCrossChainFactory.createTrade,
//     meson: MesonCrossChainFactory.createTrade,
//     orbiter_bridge: OrbiterBridgeFactory.createTrade,
//     owl_to_bridge: (...args: AbstractConstructorParameters<typeof OwlToBridgeTrade>) =>
//         new OwlToBridgeTrade(...args),
//     pulsechain_bridge: (...args: AbstractConstructorParameters<typeof PulseChainCrossChainTrade>) =>
//         new PulseChainCrossChainTrade(...args),
//     rango: RangoCrossChainFactory.createTrade,
//     retro_bridge: RetroBridgeFactory.createTrade,
//     router: RouterCrossChainFactory.createTrade,
//     scroll_bridge: (...args: AbstractConstructorParameters<typeof ScrollBridgeTrade>) =>
//         new ScrollBridgeTrade(...args),
//     simple_swap: (...args: AbstractConstructorParameters<typeof SimpleSwapCcrTrade>) =>
//         new SimpleSwapCcrTrade(...args),
//     squidrouter: (...args: AbstractConstructorParameters<typeof SquidrouterCrossChainTrade>) =>
//         new SquidrouterCrossChainTrade(...args),
//     stargate: (...args: AbstractConstructorParameters<typeof StargateCrossChainTrade>) =>
//         new StargateCrossChainTrade(...args),
//     stargate_v2: (...args: AbstractConstructorParameters<typeof StargateV2CrossChainTrade>) =>
//         new StargateV2CrossChainTrade(...args),
//     symbiosis: SymbiosisCrossChainFactory.createTrade,
//     taiko_bridge: (...args: AbstractConstructorParameters<typeof TaikoBridgeTrade>) =>
//         new TaikoBridgeTrade(...args),
//     unizen: (...args: AbstractConstructorParameters<typeof UniZenCcrTrade>) =>
//         new UniZenCcrTrade(...args),
//     xy: (...args: AbstractConstructorParameters<typeof XyCrossChainTrade>) =>
//         new XyCrossChainTrade(...args)
// } as const;
//
// const linterCheck: Record<Exclude<CrossChainTradeType, 'multichain'>, unknown> = { ...map };
//
// export const typeTradeMapping = { ...linterCheck } as typeof map;
