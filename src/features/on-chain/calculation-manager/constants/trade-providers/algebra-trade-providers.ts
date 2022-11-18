import { AlgebraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-provider';
import { QuickSwapV3Provider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/quick-swap-v3-provider';

export const AlgebraTradeProviders = [AlgebraProvider, QuickSwapV3Provider] as const;
