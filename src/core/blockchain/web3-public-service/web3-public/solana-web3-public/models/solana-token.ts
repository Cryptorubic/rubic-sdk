export interface SolanaToken {
    name: string;
    symbol: string;
    logoURI: string | null;
    verified?: boolean;
    address: string;
    decimals: number | null;
    holders?: number | null;
}
