import { SushiSwapArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-provider';
import { TrisolarisAuroraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/trisolaris-aurora/trisolaris-aurora-provider';
import { WannaSwapAuroraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-provider';
import { JoeProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/joe/joe-provider';
import { PangolinProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/pangolin-provider';
import { SushiSwapAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { OolongSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/boba/oolong-swap/oolong-swap-provider';
import { PancakeSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-swap/pancake-swap-provider';
import { SushiSwapBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { SushiSwapEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { UniSwapV2EthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { SushiSwapEthereumPowProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/sushi-swap-ethereum-pow/sushi-swap-ethereum-pow-provider';
import { UniSwapV2EthereumPowProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v2-ethereum-pow/uni-swap-v2-ethereum-pow-provider';
import { SoulSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/soul-swap/soul-swap-provider';
import { SpiritSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SpookySwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/spooky-swap/spooky-swap-provider';
import { SushiSwapFantomProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapHarmonyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { TradeHarmonySwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/trader-harmony/trader-harmony-provider';
import { ViperSwapHarmonyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/viper-swap-harmony/viper-swap-harmony-provider';
import { ElkProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/elk/elk-provider';
import { JupiterSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/jupiter-swap/jupiter-swap-provider';
import { PhotonSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/photon-swap/photon-swap-provider';
import { SurfdexProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/surfdex/surfdex-provider';
import { ClaimSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/claim-swap/claim-swap-provider';
import { NetSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/metis/net-swap/net-swap-provider';
import { SolarbeamProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/solarbeam/solarbeam-provider';
import { SushiSwapMoonriverProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { YuzuSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/oasis/yuzu-swap/yuzu-swap-provider';
import { QuickSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap/quick-swap-provider';
import { SushiSwapPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { PegasysProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/pegasys/pegasys-provider';
import { ApeSwapTelosProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/ape-swap/ape-swap-telos-provider';
import { OmnidexProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/omnidex/omnidex-provider';
import { SushiSwapTelosProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/sushi-swap-telos/sushi-swap-telos-provider';
import { ZappyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/zappy/trisolaris-aurora-provider';
import { AstroSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/astro-swap/astro-swap-provider';
import { WagyuSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/wagyu-swap/wagyu-swap-provider';

export const UniswapV2TradeProviders = [
    // ethereum
    UniSwapV2EthereumProvider,
    SushiSwapEthereumProvider,
    // bsc
    PancakeSwapProvider,
    SushiSwapBscProvider,
    // polygon
    QuickSwapProvider,
    SushiSwapPolygonProvider,
    // avalanche
    JoeProvider,
    PangolinProvider,
    SushiSwapAvalancheProvider,
    // moonriver
    SolarbeamProvider,
    SushiSwapMoonriverProvider,
    // fantom
    SpiritSwapProvider,
    SpookySwapProvider,
    SoulSwapProvider,
    SushiSwapFantomProvider,
    // harmony
    SushiSwapHarmonyProvider,
    ViperSwapHarmonyProvider,
    TradeHarmonySwapProvider,
    // arbitrum
    SushiSwapArbitrumProvider,
    // aurora
    TrisolarisAuroraProvider,
    WannaSwapAuroraProvider,
    // telos
    SushiSwapTelosProvider,
    ZappyProvider,
    ApeSwapTelosProvider,
    OmnidexProvider,
    // Boba
    OolongSwapProvider,
    // Ethereum PoW
    UniSwapV2EthereumPowProvider,
    SushiSwapEthereumPowProvider,
    // Kava
    JupiterSwapProvider,
    PhotonSwapProvider,
    ElkProvider,
    SurfdexProvider,
    // Oasis
    YuzuSwapProvider,
    // Metis
    NetSwapProvider,
    // Klaytn
    ClaimSwapProvider,
    // Velas
    WagyuSwapProvider,
    AstroSwapProvider,
    // Syscoin
    PegasysProvider
] as const;
