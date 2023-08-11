import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PancakeRouterProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/pancake-router/pancake-router-provider';
import { polygonZkEvm } from 'viem/chains';

export class PancakeRouterPolygonZkEvmProvider extends PancakeRouterProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON_ZKEVM;

    protected readonly chain = polygonZkEvm;

    protected readonly dexAddress = '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86';

    protected readonly v3subgraphAddress =
        'https://api.studio.thegraph.com/query/45376/exchange-v3-polygon-zkevm/v0.0.0';

    protected readonly v2subgraphAddress =
        'https://api.studio.thegraph.com/query/45376/exchange-v2-polygon-zkevm/version/latest';

    protected readonly maxHops = 2;

    protected readonly maxSplits = 2;
}
