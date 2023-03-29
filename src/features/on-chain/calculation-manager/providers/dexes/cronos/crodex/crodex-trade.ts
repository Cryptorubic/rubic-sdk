import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { CRODEX_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/crodex/constants';

export class CrodexTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.CRO_DEX;
    }

    public readonly dexContractAddress = CRODEX_CONTRACT_ADDRESS;
}
