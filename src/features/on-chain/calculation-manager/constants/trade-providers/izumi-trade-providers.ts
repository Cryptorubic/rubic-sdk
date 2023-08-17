import { IzumiBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/izumi-bsc/izumi-bsc-provider';
import { IzumiZksyncProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/izumi-zksync/izumi-zksync-provider';

export const izumiTradeProviders = [IzumiBscProvider, IzumiZksyncProvider];
