import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SURFDEX_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/surfdex/constants';

export class SurfdexTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SURFDEX;
    }

    public readonly dexContractAddress = SURFDEX_CONTRACT_ADDRESS;
}
