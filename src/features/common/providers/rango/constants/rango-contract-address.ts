import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { rubicProxyContractAddress } from '../../../../cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from '../../../../cross-chain/calculation-manager/providers/common/models/universal-contract';
import { RangoSupportedBlockchain } from '../models/rango-supported-blockchains';

export const RangoContractAddresses: Record<RangoSupportedBlockchain, UniversalContract> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.CRONOS]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.MOONBEAM]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.GNOSIS]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.STARKNET]: {
        providerGateway: '',
        providerRouter: '',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    // ANOTHER ADDRESS FOR BOBA
    [BLOCKCHAIN_NAME.BOBA]: {
        providerGateway: '0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4',
        providerRouter: '0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.BOBA_BSC]: {
        providerGateway: '0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4',
        providerRouter: '0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: {
        providerGateway: '0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4',
        providerRouter: '0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    }
};
