import { IzumiBaseProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/base/izumi-base/izumi-base-provider';
import { IzumiBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/izumi-bsc/izumi-bsc-provider';
import { IzumiLineaProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/izumi-linea/izumi-linea-provider';
import { IzumiMantleProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/izumi-mantle/izumi-mantle-provider';
import { IzumiZksyncProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/izumi-zksync/izumi-zksync-provider';

export const izumiTradeProviders = [
    IzumiBscProvider,
    IzumiZksyncProvider,
    IzumiMantleProvider,
    IzumiBaseProvider,
    IzumiLineaProvider
];
