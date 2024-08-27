import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { MACARON_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/bitlayer/macaron/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class MacaronTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.MACARON;
    }

    public readonly dexContractAddress = MACARON_CONTRACT_ADDRESS;
}
