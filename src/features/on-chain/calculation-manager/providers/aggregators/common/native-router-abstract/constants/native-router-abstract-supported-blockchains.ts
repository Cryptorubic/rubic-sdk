import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { NativeRouterSupportedBlockchains } from '../../../native-router/constants/native-router-supported-blockchains';
import { ZetaswapOnChainSupportedBlockchains } from '../../../zetaswap/constants/zetaswap-supported-blockchains';

export type AllSupportedNetworks =
    | ZetaswapOnChainSupportedBlockchains
    | NativeRouterSupportedBlockchains;
export const blockchainNameMapping: Record<AllSupportedNetworks, string> = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bsc',
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
    [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
    [BLOCKCHAIN_NAME.MANTLE]: 'mantle',
    [BLOCKCHAIN_NAME.BASE]: 'base',
    [BLOCKCHAIN_NAME.SCROLL]: 'scroll',
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 'manta',
    [BLOCKCHAIN_NAME.ZETACHAIN]: 'zetachain',
    [BLOCKCHAIN_NAME.LINEA]: 'linea',
    [BLOCKCHAIN_NAME.ZK_LINK]: 'zkLink'
} as const;
