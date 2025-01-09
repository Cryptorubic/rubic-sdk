import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { rubicProxyContractAddress } from '../../../../cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from '../../../../cross-chain/calculation-manager/providers/common/models/universal-contract';
import { RangoSupportedBlockchain } from '../models/rango-supported-blockchains';

export const rangoContractAddresses: Record<RangoSupportedBlockchain, UniversalContract> = {
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
    [BLOCKCHAIN_NAME.LINEA]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.METIS]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.ZK_SYNC]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.BASE]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.BLAST]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.SCROLL]: {
        providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    }
    // [BLOCKCHAIN_NAME.FANTOM]: {
    //     providerGateway: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    //     providerRouter: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    //     rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    // },
    // [BLOCKCHAIN_NAME.BITCOIN]: {
    //     providerGateway: '',
    //     providerRouter: '',
    //     rubicRouter: ''
    // }
};
