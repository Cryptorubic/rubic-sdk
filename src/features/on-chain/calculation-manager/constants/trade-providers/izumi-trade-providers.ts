import { IzumiBaseProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/base/izumi-base/izumi-base-provider';
import { IzumiBlastProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/izumi-blast/izumi-blast-provider';
import { IzumiBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/izumi-bsc/izumi-bsc-provider';
import { IzumiLineaProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/izumi-linea/izumi-linea-provider';
import { IzumiMantaPacificProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/manta-pacific/izumi-manta-pacific/izumi-manta-pacific-provider';
import { IzumiMantleProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/izumi-mantle/izumi-mantle-provider';
import { MerlinSwapMerlinProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/merlin/merlin-swap/merlin-swap-merlin-provider';
import { IzumiModeProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/izumi-mode/izumi-mode-provider';
import { IzumiScrollProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll/izumi-scroll/izumi-scroll-provider';
import { IzumiTaikoProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/taiko/izumi-taiko/izumi-taiko-provider';
import { IzumiXlayerProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/xlayer/izumi-xlayer/izumi-xlayer-provider';
import { IzumiZetachainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/izumi-zetachain/izumi-zetachain-provider';
import { IzumiZkfairProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zkfair/izumi-zkfair/izumi-zkfair-provider';
import { IzumiZkLinkProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zklink/izumi-zklink/izumi-zklink-provider';
import { IzumiZksyncProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/izumi-zksync/izumi-zksync-provider';

import { IzumiArbitrumProvider } from '../../providers/dexes/arbitrum/izumi-arbitrum/izumi-arbitrum-provider';
import { IzumiGravityProvider } from '../../providers/dexes/gravity/izumi-gravity/izumi-gravity-provider';
import { IzumiKromaProvider } from '../../providers/dexes/kroma/izumi-kroma/izumi-kroma-provider';
import { IzumiMonadTestnetProvider } from '../../providers/dexes/monad-testnet/izumi-monad-testnet/izumi-monad-testnet-provider';

export const izumiTradeProviders = [
    IzumiBscProvider,
    IzumiZksyncProvider,
    IzumiMantleProvider,
    IzumiBaseProvider,
    IzumiLineaProvider,
    IzumiMantaPacificProvider,
    IzumiZetachainProvider,
    IzumiKromaProvider,
    IzumiArbitrumProvider,
    MerlinSwapMerlinProvider,
    IzumiZkfairProvider,
    IzumiZkLinkProvider,
    IzumiModeProvider,
    IzumiTaikoProvider,
    // IzumiBlastProvider
    IzumiBlastProvider,
    // IzumiMerlinProvider,
    IzumiScrollProvider,
    IzumiXlayerProvider,
    IzumiGravityProvider,

    // testnets
    IzumiMonadTestnetProvider
];
