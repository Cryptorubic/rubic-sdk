import { CurveArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/curve-arbitrum/curve-arbitrum-provider';
import { CurveAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/curve-avalanche/curve-avalanche-provider';
import { CurveCeloProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/celo/curve-celo/curve-celo-provider';
import { CurveEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/curve-ethereum/curve-ethereum-provider';
import { CurveFantomProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/curve-fantom/curve-fantom-provider';
import { CurveGnosisProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/gnosis/curve-gnosis/curve-gnosis-provider';
import { CurveKavaProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/curve-kava/curve-kava-provider';
import { CurveMoonbeamProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/moonbeam/curve-moonbeam/curve-moonbeam-provider';
import { CurveOptimismProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/optimism/curve-optimism/curve-optimism-provider';
import { CurvePolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/curve-polygon/curve-polygon-provider';
import { CurveFraxtalTrade } from '../../providers/dexes/fraxtal/curve-fraxtal/curve-fraxtal-trade';
import { CurveFraxtalProvider } from '../../providers/dexes/fraxtal/curve-fraxtal/curve-fraxtal-provider';

export const CurveTradeProviders = [
    CurveArbitrumProvider,
    CurveAvalancheProvider,
    CurveCeloProvider,
    CurveEthereumProvider,
    CurveFantomProvider,
    CurveKavaProvider,
    CurveGnosisProvider,
    CurveMoonbeamProvider,
    CurveOptimismProvider,
    CurvePolygonProvider,
    CurveFraxtalProvider
] as const;
