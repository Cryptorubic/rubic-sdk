import { IzumiBaseProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/base/izumi-base/izumi-base-provider';
import { IzumiBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/izumi-bsc/izumi-bsc-provider';
import { IzumiLineaProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/izumi-linea/izumi-linea-provider';
import { IzumiMantaPacificProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/manta-pacific/izumi-manta-pacific/izumi-manta-pacific-provider';
import { IzumiMantleProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/izumi-mantle/izumi-mantle-provider';
import { MerlinSwapMerlinProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/merlin/merlin-swap/merlin-swap-merlin-provider';
import { IzumiZetachainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/izumi-zetachain/izumi-zetachain-provider';
import { IzumiZksyncProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/izumi-zksync/izumi-zksync-provider';

import { IzumiArbitrumProvider } from '../../providers/dexes/arbitrum/izumi-arbitrum/izumi-arbitrum-provider';
import { IzumiKromaProvider } from '../../providers/dexes/kroma/izumi-kroma/izumi-kroma-provider';

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
    MerlinSwapMerlinProvider
    // IzumiBlastProvider
];
