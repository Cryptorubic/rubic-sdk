import { UniSwapV3ArbitrumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/uni-swap-v3-arbitrum/uni-swap-v3-arbitrum-provider';
import { UniSwapV3EthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { UniSwapV3EthereumPowProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum-pow/uni-swap-v3-ethereum-pow/uni-swap-v3-ethereum-pow-provider';
import { FusionXProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/fusionx/fusionx-provider';
import { UniSwapV3PolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { UniSwapV3ScrollSepoliaProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v3-scroll-sepolia/uni-swap-v3-scroll-sepolia-provider';

import { KodiakV3Provider } from '../../providers/dexes/berachain/kodiak-v3-provider/kodiak-v3-provider';
import { EnosysV3FlareProvider } from '../../providers/dexes/flare/enosys-flare/enosys-v3-flare/enosys-v3-flare-provider';
import { SparkDexV3FlareProvider } from '../../providers/dexes/flare/spark-dex-flare/spark-dex-v3-flare/spark-dex-v3-flare-provider';
import { BrontoFinanceProvider } from '../../providers/dexes/megaeth-testnet/bronto-finance/bronto-finance-provider';
import { UniSwapV3UnichainProvider } from '../../providers/dexes/unichain/uni-v3/unichain-uni-v3-provider';

export const UniswapV3TradeProviders = [
    UniSwapV3EthereumProvider,
    UniSwapV3PolygonProvider,
    UniSwapV3ArbitrumProvider,
    UniSwapV3EthereumPowProvider,
    UniSwapV3UnichainProvider,
    // HorizondexProvider, // disabled due to risk of hacking
    FusionXProvider,
    UniSwapV3ScrollSepoliaProvider,
    SparkDexV3FlareProvider,
    EnosysV3FlareProvider,
    KodiakV3Provider,

    //testnets
    BrontoFinanceProvider
] as const;
