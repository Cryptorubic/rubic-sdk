import { AbiItem } from 'web3-utils';

export const METIS_ABI = [
    {
        type: 'constructor',
        stateMutability: 'nonpayable',
        inputs: [
            { type: 'address', name: '_factory', internalType: 'address' },
            { type: 'address', name: '_Metis', internalType: 'address' }
        ]
    },
    {
        type: 'event',
        name: 'OwnershipTransferred',
        inputs: [
            { type: 'address', name: 'previousOwner', internalType: 'address', indexed: true },
            { type: 'address', name: 'newOwner', internalType: 'address', indexed: true }
        ],
        anonymous: false
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'Metis',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountA', internalType: 'uint256' },
            { type: 'uint256', name: 'amountB', internalType: 'uint256' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' }
        ],
        name: 'addLiquidity',
        inputs: [
            { type: 'address', name: 'tokenA', internalType: 'address' },
            { type: 'address', name: 'tokenB', internalType: 'address' },
            { type: 'uint256', name: 'amountADesired', internalType: 'uint256' },
            { type: 'uint256', name: 'amountBDesired', internalType: 'uint256' },
            { type: 'uint256', name: 'amountAMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountBMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [
            { type: 'uint256', name: 'amountToken', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetis', internalType: 'uint256' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' }
        ],
        name: 'addLiquidityMetis',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'amountTokenDesired', internalType: 'uint256' },
            { type: 'uint256', name: 'amountTokenMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetisMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'factory',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256', name: 'amountIn', internalType: 'uint256' }],
        name: 'getAmountIn',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'uint256', name: 'reserveIn', internalType: 'uint256' },
            { type: 'uint256', name: 'reserveOut', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256', name: 'amountOut', internalType: 'uint256' }],
        name: 'getAmountOut',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'reserveIn', internalType: 'uint256' },
            { type: 'uint256', name: 'reserveOut', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'getAmountsIn',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'getAmountsOut',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
        name: 'isOwner',
        inputs: [{ type: 'address', name: 'account', internalType: 'address' }]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'owner',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'pure',
        outputs: [{ type: 'uint256', name: 'amountB', internalType: 'uint256' }],
        name: 'quote',
        inputs: [
            { type: 'uint256', name: 'amountA', internalType: 'uint256' },
            { type: 'uint256', name: 'reserveA', internalType: 'uint256' },
            { type: 'uint256', name: 'reserveB', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountA', internalType: 'uint256' },
            { type: 'uint256', name: 'amountB', internalType: 'uint256' }
        ],
        name: 'removeLiquidity',
        inputs: [
            { type: 'address', name: 'tokenA', internalType: 'address' },
            { type: 'address', name: 'tokenB', internalType: 'address' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' },
            { type: 'uint256', name: 'amountAMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountBMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountToken', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetis', internalType: 'uint256' }
        ],
        name: 'removeLiquidityMetis',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' },
            { type: 'uint256', name: 'amountTokenMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetisMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256', name: 'amountMetis', internalType: 'uint256' }],
        name: 'removeLiquidityMetisSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' },
            { type: 'uint256', name: 'amountTokenMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetisMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountToken', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetis', internalType: 'uint256' }
        ],
        name: 'removeLiquidityMetisWithPermit',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' },
            { type: 'uint256', name: 'amountTokenMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetisMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' },
            { type: 'bool', name: 'approveMax', internalType: 'bool' },
            { type: 'uint8', name: 'v', internalType: 'uint8' },
            { type: 'bytes32', name: 'r', internalType: 'bytes32' },
            { type: 'bytes32', name: 's', internalType: 'bytes32' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256', name: 'amountMetis', internalType: 'uint256' }],
        name: 'removeLiquidityMetisWithPermitSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'address', name: 'token', internalType: 'address' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' },
            { type: 'uint256', name: 'amountTokenMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountMetisMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' },
            { type: 'bool', name: 'approveMax', internalType: 'bool' },
            { type: 'uint8', name: 'v', internalType: 'uint8' },
            { type: 'bytes32', name: 'r', internalType: 'bytes32' },
            { type: 'bytes32', name: 's', internalType: 'bytes32' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [
            { type: 'uint256', name: 'amountA', internalType: 'uint256' },
            { type: 'uint256', name: 'amountB', internalType: 'uint256' }
        ],
        name: 'removeLiquidityWithPermit',
        inputs: [
            { type: 'address', name: 'tokenA', internalType: 'address' },
            { type: 'address', name: 'tokenB', internalType: 'address' },
            { type: 'uint256', name: 'liquidity', internalType: 'uint256' },
            { type: 'uint256', name: 'amountAMin', internalType: 'uint256' },
            { type: 'uint256', name: 'amountBMin', internalType: 'uint256' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' },
            { type: 'bool', name: 'approveMax', internalType: 'bool' },
            { type: 'uint8', name: 'v', internalType: 'uint8' },
            { type: 'bytes32', name: 'r', internalType: 'bytes32' },
            { type: 'bytes32', name: 's', internalType: 'bytes32' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'renounceOwnership',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'setSwapMining',
        inputs: [{ type: 'address', name: '_swapMininng', internalType: 'address' }]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactMetisForTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [],
        name: 'swapExactMetisForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForMetis',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForMetisSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapExactTokensForTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        inputs: [
            { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
            { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'payable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapMetisForExactTokens',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'view',
        outputs: [{ type: 'address', name: '', internalType: 'address' }],
        name: 'swapMining',
        inputs: []
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapTokensForExactMetis',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'uint256', name: 'amountInMax', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
        name: 'swapTokensForExactTokens',
        inputs: [
            { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
            { type: 'uint256', name: 'amountInMax', internalType: 'uint256' },
            { type: 'address[]', name: 'path', internalType: 'address[]' },
            { type: 'address', name: 'to', internalType: 'address' },
            { type: 'uint256', name: 'deadline', internalType: 'uint256' }
        ]
    },
    {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'transferOwnership',
        inputs: [{ type: 'address', name: 'newOwner', internalType: 'address' }]
    },
    { type: 'receive', stateMutability: 'payable' }
] as AbiItem[];
