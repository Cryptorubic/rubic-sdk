import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ConnextCrossChainSupportedBlockchain } from './connext-supported-blockchains';

export const connextSubgraphApi: Record<ConnextCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]:
        'https://api.thegraph.com/subgraphs/name/connext/nxtp-mainnet-v1-runtime',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]:
        'https://api.thegraph.com/subgraphs/name/connext/nxtp-bsc-v1-runtime',
    [BLOCKCHAIN_NAME.POLYGON]:
        'https://api.thegraph.com/subgraphs/name/connext/nxtp-matic-v1-runtime',
    [BLOCKCHAIN_NAME.ARBITRUM]:
        'https://api.thegraph.com/subgraphs/name/connext/nxtp-arbitrum-one-v1-runtime',
    [BLOCKCHAIN_NAME.OPTIMISM]:
        'https://api.thegraph.com/subgraphs/name/connext/nxtp-optimism-v1-runtime',
    [BLOCKCHAIN_NAME.GNOSIS]:
        'https://api.thegraph.com/subgraphs/name/connext/nxtp-xdai-v1-runtime',
    [BLOCKCHAIN_NAME.MOONBEAM]:
        'https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-moonbeam-v1-runtime'
};

// optimism
// https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-optimism-v1-runtime

// bsc
// [
//     "https://subgraphs.connext.p2p.org/subgraphs/name/connext/nxtp-bsc",
//     "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-bsc-v1-runtime",
//     "https://api.thegraph.com/subgraphs/name/connext/nxtp-bsc-v1-runtime"
// ]

// gnosis
// [
//     "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-xdai-v1-runtime",
//     "https://api.thegraph.com/subgraphs/name/connext/nxtp-xdai-v1-runtime"
// ]

// polygon
// [
//     "https://subgraphs.connext.p2p.org/subgraphs/name/connext/nxtp-matic",
//     "https://api.thegraph.com/subgraphs/name/connext/nxtp-matic-v1-runtime",
//     "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-matic-v1-runtime"
// ]

// arbitrum
// [
//     "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-arbitrum-one-v1-runtime",
//     "https://api.thegraph.com/subgraphs/name/connext/nxtp-arbitrum-one-v1-runtime"
// ]
