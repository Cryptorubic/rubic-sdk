import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { TssAvailableEddyBridgeChain } from './eddy-bridge-supported-chains';

export const EDDY_OMNI_CONTRACT_IN_ZETACHAIN = '0xD494685B830e8C81Af6c7DA2B6E6C70e526019cE';
export const EDDY_OMNI_CONTRACT_IN_ZETACHAIN_FOR_ANY_CHAIN =
    '0x3BdEA1CB47Ce41d3c7F6886A42117266EC457370';

export const TSS_ADDRESSES_EDDY_BRIDGE: Record<TssAvailableEddyBridgeChain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x70e967acFcC17c3941E87562161406d41676FD83',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x70e967acFcC17c3941E87562161406d41676FD83'
};

export const CUSTODY_ADDRESSES: Partial<Record<EvmBlockchainName, string>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x0000030Ec64DF25301d8414eE5a29588C4B0dE10',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x00000fF8fA992424957F97688015814e707A0115'
};

export const ZETA_CHAIN_SUPPORTED_TOKENS: ZetachainTokenInfo[] = [
    {
        address: '0xd97b1de3619ed2c6beb3860147e30ca8a7dc9891',
        symbol: 'ETH',
        relativeChain: BLOCKCHAIN_NAME.ETHEREUM
    },
    {
        address: '0x48f80608b672dc30dc7e3dbbd0343c5f02c738eb',
        symbol: 'BNB',
        relativeChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    },
    {
        address: '0x0cbe0dF132a6c6B4a2974Fa1b7Fb953CF0Cc798a',
        symbol: 'USDC',
        relativeChain: BLOCKCHAIN_NAME.ETHEREUM
    },
    {
        address: '0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7',
        symbol: 'USDT',
        relativeChain: BLOCKCHAIN_NAME.ETHEREUM
    },
    {
        address: '0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0',
        symbol: 'USDC',
        relativeChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    },
    {
        address: '0x91d4F0D54090Df2D81e834c3c8CE71C6c865e79F',
        symbol: 'USDT',
        relativeChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    }
];

interface ZetachainTokenInfo {
    symbol: string;
    relativeChain: EvmBlockchainName;
    address: string;
}
