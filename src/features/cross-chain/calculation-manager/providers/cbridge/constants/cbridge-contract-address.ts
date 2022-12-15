import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

export const cbridgeContractAddress: Record<
    CbridgeCrossChainSupportedBlockchain,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        providerGateway: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
        providerRouter: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        providerGateway: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
        providerRouter: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.POLYGON]
    }
};
