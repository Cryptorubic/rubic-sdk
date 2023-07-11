import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const subgraphUrls: Partial<Record<EvmBlockchainName, string>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]:
        'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-eth',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: `https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc`,
    [BLOCKCHAIN_NAME.ARBITRUM]:
        'https://thegraph.com/hosted-service/subgraph/chef-jojo/exchange-v3-arb'
    // [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'https://api.studio.thegraph.com/query/45376/exchange-v3-polygon-zkevm/v0.0.0',
    // [BLOCKCHAIN_NAME.ZK_SYNC]: null
};
export const graphQlClients = {};
