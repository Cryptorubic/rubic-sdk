import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { BULBASWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/morph/bulbaswap/constants';

export class BulbaswapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BULBA_SWAP;
    }

    public readonly dexContractAddress = BULBASWAP_CONTRACT_ADDRESS;
}
