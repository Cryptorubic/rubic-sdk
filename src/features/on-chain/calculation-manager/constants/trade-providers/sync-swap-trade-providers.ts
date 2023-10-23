import { LineaSyncSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/sync-swap/linea-sync-swap-provider';
import { ScrollSyncSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll/sync-swap/scroll-sync-swap-provider';
import { ZkSyncSyncSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/zksync-sync-swap-provider';

export const syncSwapTradeProviders = [
    ZkSyncSyncSwapProvider,
    LineaSyncSwapProvider,
    ScrollSyncSwapProvider
];
