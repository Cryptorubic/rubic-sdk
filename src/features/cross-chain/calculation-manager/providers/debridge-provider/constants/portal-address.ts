import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';

export const portalAddresses: Record<DeBridgeCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
    [BLOCKCHAIN_NAME.POLYGON]: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
    [BLOCKCHAIN_NAME.LINEA]: '',
    [BLOCKCHAIN_NAME.OPTIMISM]: '',
    [BLOCKCHAIN_NAME.BASE]: ''
};
