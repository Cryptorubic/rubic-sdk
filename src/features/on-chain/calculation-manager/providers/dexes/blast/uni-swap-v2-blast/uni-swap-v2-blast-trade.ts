import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UNISWAP_V2_BLAST_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v2-blast/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class UniSwapV2BlastTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FENIX_V2;
    }

    public readonly dexContractAddress = UNISWAP_V2_BLAST_CONTRACT_ADDRESS;
}
