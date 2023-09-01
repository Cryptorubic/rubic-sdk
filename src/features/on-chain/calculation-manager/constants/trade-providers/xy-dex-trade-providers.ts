import { XyDexArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/xy-dex-arbitrum/xy-dex-arbitrum-provider';
import { XyDexAstarProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/astar-evm/xy-dex-astar/xy-dex-astar-provider';
import { XyDexAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/xy-dex-avalanche/xy-dex-avalanche-provider';
import { XyDexBaseProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/base/xy-dex-base/xy-dex-base-provider';
import { XyDexBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/xy-dex-bsc/xy-dex-bsc-provider';
import { XyDexCronosProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/xy-dex-cronos/xy-dex-cronos-provider';
import { XyDexEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/xy-dex-ethereum/xy-dex-ethereum-provider';
import { XyDexFantomProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/xy-dex-fantom/xy-dex-fantom-provider';
import { XyDexKlaytnProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/xy-dex-klaytn/xy-dex-klaytn-provider';
import { XyDexLineaProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/xy-dex-linea/xy-dex-linea-provider';
import { XyDexMoonriverProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/xy-dex-moonriver/xy-dex-moonriver-provider';
import { XyDexOptimismProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/optimism/xy-dex-optimism/xy-dex-optimism-provider';
import { XyDexPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/xy-dex-polygon/xy-dex-polygon-provider';
import { XyDexZkevmProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon-zkevm/xy-dex-zkevm/xy-dex-zkevm-provider';
import { XyDexZksyncProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/xy-dex-zksync/xy-dex-zksync-provider';

export const xyDexTradeProviders = [
    XyDexBscProvider,
    XyDexEthereumProvider,
    XyDexPolygonProvider,
    XyDexFantomProvider,
    XyDexCronosProvider,
    XyDexAvalancheProvider,
    XyDexArbitrumProvider,
    XyDexOptimismProvider,
    XyDexAstarProvider,
    XyDexMoonriverProvider,
    XyDexKlaytnProvider,
    XyDexZksyncProvider,
    XyDexZkevmProvider,
    XyDexLineaProvider,
    XyDexBaseProvider
];
