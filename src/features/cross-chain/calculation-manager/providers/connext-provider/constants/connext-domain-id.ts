import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ConnextCrossChainSupportedBlockchain } from './connext-supported-blockchains';

export const connextDomainId: Record<ConnextCrossChainSupportedBlockchain, number> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 6648936,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 6450786,
    [BLOCKCHAIN_NAME.POLYGON]: 1886350457,
    [BLOCKCHAIN_NAME.ARBITRUM]: 1634886255,
    [BLOCKCHAIN_NAME.GNOSIS]: 6778479,
    [BLOCKCHAIN_NAME.MOONBEAM]: 1650811245,
    [BLOCKCHAIN_NAME.OPTIMISM]: 1869640809
};
