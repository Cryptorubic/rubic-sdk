import { WalletProvider } from 'src/core/sdk/models/wallet-provider';

export type ProviderAddress = Record<keyof WalletProvider, string>;
