import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PancakeRouterProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/pancake-router/pancake-router-provider';
import { bsc } from 'viem/chains';

export class PancakeRouterBscProvider extends PancakeRouterProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    protected readonly chain = bsc;

    protected readonly dexAddress = '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4';

    protected readonly v3subgraphAddress =
        'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc';

    protected readonly v2subgraphAddress = 'https://proxy-worker-api.pancakeswap.com/bsc-exchange';

    protected readonly maxHops = 3;

    protected readonly maxSplits = 4;
}
