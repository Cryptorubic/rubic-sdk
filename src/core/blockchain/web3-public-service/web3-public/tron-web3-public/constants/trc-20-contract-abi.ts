export const TRC20_CONTRACT_ABI = [
    {
        outputs: [{ type: 'string' }],
        name: 'symbol',
        stateMutability: 'View',
        type: 'Function'
    },
    {
        outputs: [{ type: 'uint256' }],
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        stateMutability: 'View',
        type: 'Function'
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' }
        ],
        name: 'approve',
        stateMutability: 'Nonpayable',
        type: 'Function'
    },
    {
        outputs: [{ type: 'uint256' }],
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        stateMutability: 'View',
        type: 'Function'
    },
    {
        outputs: [{ type: 'uint8' }],
        name: 'decimals',
        stateMutability: 'View',
        type: 'Function'
    },
    {
        outputs: [{ type: 'string' }],
        name: 'name',
        stateMutability: 'View',
        type: 'Function'
    },
    {
        outputs: [{ type: 'uint256' }],
        name: 'totalSupply',
        stateMutability: 'View',
        type: 'Function'
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' }
        ],
        name: 'transfer',
        stateMutability: 'Nonpayable',
        type: 'Function'
    },
    {
        outputs: [{ type: 'bool' }],
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            {
                name: 'value',
                type: 'uint256'
            }
        ],
        name: 'transferFrom',
        stateMutability: 'Nonpayable',
        type: 'Function'
    }
];
