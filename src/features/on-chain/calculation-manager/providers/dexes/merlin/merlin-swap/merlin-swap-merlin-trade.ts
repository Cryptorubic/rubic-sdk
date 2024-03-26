import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { IzumiTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-trade';

export class MerlinSwapMerlinTrade extends IzumiTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.MERLIN_SWAP;
    }
}
