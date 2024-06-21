import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { TssAvailableEddyBridgeChain } from './eddy-bridge-supported-chains';

export const OMNI_BRIDGE_ADDRESS_IN_ZETACHAIN = '0xd91b507F2A3e2D4A32d0C86Ac19FEAD2D461008D';

export const TSS_ADDRESSES_EDDY_BRIDGE: Record<TssAvailableEddyBridgeChain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x70e967acFcC17c3941E87562161406d41676FD83',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x70e967acFcC17c3941E87562161406d41676FD83'
};
