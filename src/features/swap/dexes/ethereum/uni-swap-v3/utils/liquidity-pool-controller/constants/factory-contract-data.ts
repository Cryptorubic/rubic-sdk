import { AbiItem } from 'web3-utils';

export const factoryContractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

export const factoryContractAbi = [
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'uint24', name: '', type: 'uint24' }
        ],
        name: 'getPool',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
