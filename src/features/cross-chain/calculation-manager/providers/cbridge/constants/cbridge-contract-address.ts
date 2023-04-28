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
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        providerGateway: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
        providerRouter: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerGateway: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
        providerRouter: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerGateway: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
        providerRouter: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        providerGateway: '0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF',
        providerRouter: '0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        providerGateway: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
        providerRouter: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        providerGateway: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
        providerRouter: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        providerGateway: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
        providerRouter: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
        rubicRouter: '0x33798753ec66aEc00ed7E337B41F444f53A63333'
    },
    [BLOCKCHAIN_NAME.ASTAR_EVM]: {
        providerGateway: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
        providerRouter: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
        rubicRouter: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C'
    }
};
