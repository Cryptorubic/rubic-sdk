import { WalletProvider } from 'src/core/sdk/models/wallet-provider';

export type ProviderAddress = Partial<Record<keyof WalletProvider, string>>;
