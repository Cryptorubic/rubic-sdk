import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const customDeflationTokeList: Partial<Record<EvmBlockchainName, string[]>> = {
    [BLOCKCHAIN_NAME.FLARE]: ['0xc18f99ce6dd6278be2d3f1e738ed11623444ae33'],
    [BLOCKCHAIN_NAME.POLYGON]: ['0x7b3bd12675c6b9d6993eb81283cb68e6eb9260b5']
};
