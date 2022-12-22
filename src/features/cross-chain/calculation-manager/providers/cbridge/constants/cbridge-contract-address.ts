import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

export const cbridgeContractAddress: Record<
    CbridgeCrossChainSupportedBlockchain,
    UniversalContract
> = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        providerGateway: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
        providerRouter: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
        rubicRouter: '0x7205Ef74DB499Fd79EC335609D418a09c6A23861'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        providerGateway: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
        providerRouter: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
        rubicRouter: '0x3420865a31C84C468a88BcAEf6CeC69e2885e7bA'
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerGateway: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
        providerRouter: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
        rubicRouter: '0x3420865a31C84C468a88BcAEf6CeC69e2885e7bA'
    }
};
