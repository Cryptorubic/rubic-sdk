import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { ZAPPY_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/zappy/constants';

export class ZappyTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ZAPPY;
    }

    public readonly contractAddress = ZAPPY_CONTRACT_ADDRESS;
}
