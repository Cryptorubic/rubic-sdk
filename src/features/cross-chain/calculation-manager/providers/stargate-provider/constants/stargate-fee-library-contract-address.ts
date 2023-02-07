import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { StargateCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-cross-chain-supported-blockchain';

export const stargateFeeLibraryContractAddress: Record<
    StargateCrossChainSupportedBlockchain,
    string
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x6FaF1AB85FFbe7B3A557F4864046ff861734afd0',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xCa46058a5682B13c44F4Dd2558aFDEbf3A28f41f',
    [BLOCKCHAIN_NAME.POLYGON]: '0xA0732186f556F034CF9930B7796Bc3a03E614750',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x7f0369206D8a700514574dAAa0634B8A1F7149d7',
    [BLOCKCHAIN_NAME.FANTOM]: '0x6C69307f5BEFF9C77Da12ee86247641737ac349d#',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0xB1641D94684225B72F97E52b2b02Ad07F7bA9089',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0xaE8d00e43adB49d14Fa07C93b27cdB3Ee94C4675',
    [BLOCKCHAIN_NAME.METIS]: '0x9d1B1669c73b033DFe47ae5a0164Ab96df25B944'
};
