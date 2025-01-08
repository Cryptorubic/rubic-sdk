import { SushiSwapArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/sushi-swap-arbitrum/sushi-swap-arbitrum-provider';
import { ArthSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/astar-evm/arth-swap/arth-swap-provider';
import { TrisolarisAuroraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/trisolaris-aurora/trisolaris-aurora-provider';
import { WannaSwapAuroraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/wanna-swap-aurora/wanna-swap-aurora-provider';
import { JoeProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/joe/joe-provider';
import { PangolinProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/pangolin-provider';
import { SushiSwapAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { AerodromeProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/base/aerodrome/aerodrome-provider';
import { BaseSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/base/base-swap/base-swap-provider';
import { MacaronProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bitlayer/macaron/macaron-provider';
import { UniSwapV2BlastProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v2-blast/uni-swap-v2-blast-provider';
import { OolongSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/boba/oolong-swap/oolong-swap-provider';
import { SushiSwapBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-provider';
import { PancakeSwapTestnetProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/pancake-swap-testnet/pancake-swap-testnet-provider';
import { TraderJoeBsctProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/trader-joe-bsct/trader-joe-bsct-provider';
import { CroSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/cro-swap/cro-swap-provider';
import { CrodexProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/crodex/crodex-provider';
import { CronaSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/crona-swap/crona-swap-provider';
import { SushiSwapEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { UniSwapV2EthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { VerseProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/verse/verse-provider';
import { SushiSwapEthereumPowProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/sushi-swap-ethereum-pow/sushi-swap-ethereum-pow-provider';
import { UniSwapV2EthereumPowProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v2-ethereum-pow/uni-swap-v2-ethereum-pow-provider';
import { SoulSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/soul-swap/soul-swap-provider';
import { SpiritSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SpookySwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/spooky-swap/spooky-swap-provider';
import { SushiSwapFantomProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { JoeFujiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fuji/joe-fuji/joe-fuji-provider';
import { PangolinFujiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fuji/pangolin-fuji/pangolin-fuji-provider';
import { UniSwapV2GoerliProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/goerli/uni-swap-v2-goerli/uni-swap-v2-goerli-provider';
import { SushiSwapHarmonyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { TradeHarmonySwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/trader-harmony/trader-harmony-provider';
import { ViperSwapHarmonyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/viper-swap-harmony/viper-swap-harmony-provider';
import { AscentHorizenEonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/ascent-horizon-eon/ascent-horizen-eon-provider';
import { SpookySwapHorizenEonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/spooky-swap-horizen-eon/spooky-swap-horizen-eon-provider';
import { ElkProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/elk/elk-provider';
import { JupiterSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/jupiter-swap/jupiter-swap-provider';
import { PhotonSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/photon-swap/photon-swap-provider';
import { SurfdexProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/surfdex/surfdex-provider';
import { ClaimSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/claim-swap/claim-swap-provider';
import { NetSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/metis/net-swap/net-swap-provider';
import { EddyFinanceModeProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/eddy-finance-mode/eddy-finance-mode-provider';
import { SolarbeamProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/solarbeam/solarbeam-provider';
import { SushiSwapMoonriverProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { BulbaswapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/morph/bulbaswap/bulbaswap-provider';
import { QuickSwapMumbaiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mumbai/quick-swap-mumbai/quick-swap-mumbai-provider';
import { YuzuSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/oasis/yuzu-swap/yuzu-swap-provider';
import { QuickSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap/quick-swap-provider';
import { SushiSwapPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { PulseXV1Provider } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/pulsex-v1/pulsex-v1-provider';
import { PulseXV2Provider } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/pulsex-v2/pulsex-v2-provider';
import { DragonSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/sei/dragonswap/dragonswap-provider';
import { PegasysProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/pegasys/pegasys-provider';
import { ApeSwapTelosProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/ape-swap/ape-swap-telos-provider';
import { OmnidexProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/omnidex/omnidex-provider';
import { SushiSwapTelosProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/sushi-swap-telos/sushi-swap-telos-provider';
import { ZappyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/zappy/trisolaris-aurora-provider';
import { AstroSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/astro-swap/astro-swap-provider';
import { WagyuSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/wagyu-swap/wagyu-swap-provider';
import { EddyFinanceProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-provider';
import { MuteSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/mute-swap/mute-swap-provider';

import { KujataBahamutProvider } from '../../providers/dexes/bahamut/kujata-bahamut/kujata-bahamut-provider';
import { SilkSwapBahamutProvider } from '../../providers/dexes/bahamut/silk-swap-bahamut/silk-swap-bahamut-provider';
import { BlazeSwapFlareProvider } from '../../providers/dexes/flare/blaze-swap-flare/blaze-swap-flare-provider';
import { EnosysFlareProvider } from '../../providers/dexes/flare/enosys-flare/enosys-v2-flare/enosys-flare-provider';
import { SparkDexFlareProvider } from '../../providers/dexes/flare/spark-dex-flare/spark-dex-v2-flare/spark-dex-flare-provider';
import { SushiSwapZetachainProvider } from '../../providers/dexes/zetachain/sushi-swap-zetachain/sushi-swap-zetachain-provider';

export const UniswapV2TradeProviders = [
    // ethereum
    UniSwapV2EthereumProvider,
    SushiSwapEthereumProvider,
    VerseProvider,
    // bsc
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
    PegasysProvider,
    // Cronos
    CronaSwapProvider,
    CroSwapProvider,
    CrodexProvider,
    // Astar EVM
    ArthSwapProvider,
    // ZkSync
    MuteSwapProvider,
    // Pulsechain
    PulseXV1Provider,
    PulseXV2Provider,
    // Base
    BaseSwapProvider,
    AerodromeProvider,
    // BSC Testnet
    PancakeSwapTestnetProvider,
    TraderJoeBsctProvider,
    // Goerli
    UniSwapV2GoerliProvider,
    // Mumbai
    QuickSwapMumbaiProvider,
    // Fuji
    JoeFujiProvider,
    PangolinFujiProvider,
    // Scroll
    // UniSwapV2ScrollSepoliaProvider
    // horizen eon
    SpookySwapHorizenEonProvider,
    AscentHorizenEonProvider,
    // Blast
    UniSwapV2BlastProvider,
    // ZetaChain
    EddyFinanceProvider,
    SushiSwapZetachainProvider,
    // Mode
    EddyFinanceModeProvider,
    // Sei
    DragonSwapProvider,
    //Bahamut
    SilkSwapBahamutProvider,
    KujataBahamutProvider,
    // Bitlayer
    MacaronProvider,
    // Flare
    BlazeSwapFlareProvider,
    SparkDexFlareProvider,
    EnosysFlareProvider,
    // Morph
    BulbaswapProvider
] as const;
