import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { StargateCrossChainSupportedBlockchain } from './stargate-cross-chain-supported-blockchain';

export const stargateChainId: Record<StargateCrossChainSupportedBlockchain, number> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 101,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 102,
    [BLOCKCHAIN_NAME.POLYGON]: 109,
    [BLOCKCHAIN_NAME.AVALANCHE]: 106,
    [BLOCKCHAIN_NAME.FANTOM]: 112,
    [BLOCKCHAIN_NAME.ARBITRUM]: 110,
    [BLOCKCHAIN_NAME.OPTIMISM]: 111,
    [BLOCKCHAIN_NAME.METIS]: 151,
    [BLOCKCHAIN_NAME.BASE]: 184
};
