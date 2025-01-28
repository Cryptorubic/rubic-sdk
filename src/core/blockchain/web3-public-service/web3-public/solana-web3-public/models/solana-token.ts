import { PublicKey } from '@solana/web3.js';

export interface SolanaToken {
    name: string;
    symbol: string;
    logoURI: string | null;
    verified?: boolean;
    address: string;
    decimals: number | null;
    holders?: number | null;
}

export interface SolanaTokensFetchingResp {
    tokensList: SolanaToken[];
    notFetchedMints: PublicKey[];
    hasNotFetchedTokens: boolean;
}
