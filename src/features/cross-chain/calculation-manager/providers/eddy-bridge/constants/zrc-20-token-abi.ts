import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { AbiItem } from 'web3-utils';

export const ZRC_20_ABI = [
    ...ERC20_TOKEN_ABI,
    {
        inputs: [],
        name: 'withdrawGasFee',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
