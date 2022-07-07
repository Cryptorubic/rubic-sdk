import { AbiItem } from 'web3-utils';
import { LifiCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core';

export const lifiContractAddress: Record<LifiCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x5cc19C5Af9d3fec6E4df783de99cC128542Ff378',
    [BLOCKCHAIN_NAME.POLYGON]: '0x43B4be965B07edb5ce1dBaC1c6f3653806F3EE40',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x93d5592dfb36495cf348a02491ff6f888abdcb9f',
    [BLOCKCHAIN_NAME.FANTOM]: '0xf5125f87aa6abd76c744859065e9db7c126fb337'
};

export const lifiContractAbi = [
    {
        inputs: [],
        name: 'RubicFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'integratorFee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'contract IERC20', name: 'inputToken', type: 'address' },
            { internalType: 'uint256', name: 'totalInputAmount', type: 'uint256' },
            { internalType: 'address', name: 'integrator', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' }
        ],
        name: 'lifiCall',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    }
] as AbiItem[];
