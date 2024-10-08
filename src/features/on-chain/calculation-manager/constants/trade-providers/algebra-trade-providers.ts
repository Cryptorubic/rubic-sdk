import { CamelotArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/camelot-arbitrum/camelot-arbitrum-provider';
import { BerachainTestnetAlgebraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/berachain-testnet/berachain-testnet-algebra/berachain-testnet-algebra-provider';
import { BlastFenixProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/blast-fenix-provider';
import { ModeAlgebraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/algebra-mode/mode-algebra-provider';
import { AlgebraProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-provider';
import { QuickSwapV3Provider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/quick-swap-v3-provider';
import { QuickSwapV3PolygonZKEVMProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon-zkevm/quick-swap-v3/quick-swap-v3-provider';

import { AlgebraIntegralProvider } from '../../providers/dexes/arthera-testnet/algebra-integral/algebra-integral-provider';
import { CamelotGravityProvider } from '../../providers/dexes/gravity/camelot-gravity/camelot-gravity-provider';

export const AlgebraTradeProviders = [
    AlgebraProvider,
    AlgebraIntegralProvider,
    QuickSwapV3Provider,
    QuickSwapV3PolygonZKEVMProvider,
    CamelotArbitrumProvider,
    BerachainTestnetAlgebraProvider,
    ModeAlgebraProvider,
    BlastFenixProvider,
    CamelotGravityProvider
] as const;
