import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UNI_SWAP_V3_BLAST_SWAP_ROUTER_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v3-blast/constants/router-configuration';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export class UniSwapV3BlastTrade extends UniswapV3AbstractTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FENIX_V3;
    }

    public readonly dexContractAddress = UNI_SWAP_V3_BLAST_SWAP_ROUTER_CONTRACT_ADDRESS;
}
