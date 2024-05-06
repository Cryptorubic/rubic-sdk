import { AbiItem } from 'web3-utils';

export const UNISWAP_V3_BLAST_FACTORY_CONTRACT_ADDRESS =
    '0x7a44CD060afC1B6F4c80A2B9b37f4473E74E25Df';

export const UNISWAP_V3_BLAST_FACTORY_CONTRACT_ABI = [
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'poolByPair',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
