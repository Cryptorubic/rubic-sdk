import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { EywaCcrSupportedChains } from './eywa-ccr-supported-chains';

export const eywaContractAddresses: Record<EywaCcrSupportedChains, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xfa43DE785dd3Cd0ef3dAE0dD2b8bE3F1B5112d1a',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xfa43DE785dd3Cd0ef3dAE0dD2b8bE3F1B5112d1a',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0xfa43DE785dd3Cd0ef3dAE0dD2b8bE3F1B5112d1a',
    [BLOCKCHAIN_NAME.POLYGON]: '0xfa43DE785dd3Cd0ef3dAE0dD2b8bE3F1B5112d1a',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0xfa43DE785dd3Cd0ef3dAE0dD2b8bE3F1B5112d1a',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0xfa43DE785dd3Cd0ef3dAE0dD2b8bE3F1B5112d1a'
};
