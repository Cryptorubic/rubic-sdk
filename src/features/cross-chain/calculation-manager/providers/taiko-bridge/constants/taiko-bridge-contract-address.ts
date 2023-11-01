import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const taikoBridgeContractAddress = {
    [BLOCKCHAIN_NAME.SEPOLIA]: {
        nativeProvider: '0x5293Bb897db0B64FFd11E0194984E8c5F1f06178',
        erc20Provider: '0x9f1a34A0e4f6C77C3648C4d9E922DA615C64D194'
    },
    [BLOCKCHAIN_NAME.TAIKO]: {
        nativeProvider: '0x1000777700000000000000000000000000000004',
        erc20Provider: '0x1000777700000000000000000000000000000002'
    }
};
