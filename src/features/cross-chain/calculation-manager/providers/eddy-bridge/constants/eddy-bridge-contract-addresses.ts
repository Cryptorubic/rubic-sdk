import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { TssAvailableEddyBridgeChain } from './eddy-bridge-supported-chains';

export const EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN = '0xd91b507F2A3e2D4A32d0C86Ac19FEAD2D461008D';

export const TSS_ADDRESSES_EDDY_BRIDGE: Record<TssAvailableEddyBridgeChain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x70e967acFcC17c3941E87562161406d41676FD83',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x70e967acFcC17c3941E87562161406d41676FD83'
};

export const TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS: Record<string, string> = {
    ETH: '0xd97b1de3619ed2c6beb3860147e30ca8a7dc9891',
    BNB: '0x48f80608b672dc30dc7e3dbbd0343c5f02c738eb'
};
