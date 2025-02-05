import { PublicKey } from '@solana/web3.js';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

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

export interface ApiV2TokensResp {
    count: number;
    next: null | number;
    previous: null | number;
    results: Array<{
        address: string;
        name: string;
        symbol: string;
        network: BlockchainName;
        decimals: number;
        image: string;
        rank: number;
        source_rank: number;
        usdPrice: number;
    }>;
}
