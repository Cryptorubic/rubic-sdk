import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const taikoBridgeContractAddress = {
    [BLOCKCHAIN_NAME.HOLESKY]: {
        nativeProvider: '0xf458747c6d6db57970dE80Da6474C0A3dfE94BF1',
        erc20Provider: '0x095DDce4fd8818aD159D778E6a9898A2474933ca'
    },
    [BLOCKCHAIN_NAME.TAIKO]: {
        nativeProvider: '0x1670080000000000000000000000000000000001',
        erc20Provider: '0x1670080000000000000000000000000000000002'
    }
};
