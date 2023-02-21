import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export interface NativeTokenData {
    address: string;
    blockchain: string;
    ticker: string;
}

export const nativeTokensData: NativeTokenData[] = [
    {
        address: '0x4200000000000000000000000000000000000042',
        blockchain: BLOCKCHAIN_NAME.OPTIMISM,
        ticker: 'op'
    },
    {
        address: '0x471ece3750da237f93b8e339c536989b8978a438',
        blockchain: BLOCKCHAIN_NAME.CELO,
        ticker: 'celo'
    },
    {
        address: 'So11111111111111111111111111111111111111111',
        blockchain: BLOCKCHAIN_NAME.SOLANA,
        ticker: 'sol'
    },
    {
        address: 'near',
        blockchain: BLOCKCHAIN_NAME.NEAR,
        ticker: 'near'
    }
];
