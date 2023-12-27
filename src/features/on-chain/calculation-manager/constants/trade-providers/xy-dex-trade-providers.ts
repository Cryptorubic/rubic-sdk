import { XyDexArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/xy-dex-arbitrum/xy-dex-arbitrum-provider';
import { XyDexAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/xy-dex-avalanche/xy-dex-avalanche-provider';
import { XyDexBaseProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/base/xy-dex-base/xy-dex-base-provider';
import { XyDexBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/xy-dex-bsc/xy-dex-bsc-provider';
import { XyDexEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/xy-dex-ethereum/xy-dex-ethereum-provider';
import { XyDexFantomProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/xy-dex-fantom/xy-dex-fantom-provider';
import { XyDexLineaProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/xy-dex-linea/xy-dex-linea-provider';
import { XyDexMantleProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/xy-dex-mantle/xy-dex-mantle-provider';
import { XyDexMoonriverProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/xy-dex-moonriver/xy-dex-moonriver-provider';
import { XyDexOptimismProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/optimism/xy-dex-optimism/xy-dex-optimism-provider';
import { XyDexPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/xy-dex-polygon/xy-dex-polygon-provider';
import { XyDexZkevmProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon-zkevm/xy-dex-zkevm/xy-dex-zkevm-provider';
import { XyDexScrollProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll/xy-dex-scroll/xy-dex-scroll-provider';
import { XyDexZksyncProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/xy-dex-zksync/xy-dex-zksync-provider';

export const xyDexTradeProviders = [
    XyDexBscProvider,
    XyDexEthereumProvider,
    XyDexPolygonProvider,
    XyDexFantomProvider,
    XyDexAvalancheProvider,
    XyDexArbitrumProvider,
    XyDexOptimismProvider,
    XyDexMoonriverProvider,
    XyDexZksyncProvider,
    XyDexZkevmProvider,
    XyDexLineaProvider,
    XyDexBaseProvider,
    XyDexScrollProvider,
    XyDexMantleProvider
];
