import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { VERSE_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/verse/constants';

export class VerseTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.VERSE;
    }

    public readonly dexContractAddress = VERSE_CONTRACT_ADDRESS;
}
