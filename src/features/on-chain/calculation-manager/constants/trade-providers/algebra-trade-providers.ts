import { AlgebraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-provider';
import { QuickSwapV3Provider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/quick-swap-v3-provider';
import { QuickSwapV3PolygonZKEVMProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon-zkevm/quick-swap-v3/quick-swap-v3-provider';

export const AlgebraTradeProviders = [
    AlgebraProvider,
    QuickSwapV3Provider,
    QuickSwapV3PolygonZKEVMProvider
] as const;
