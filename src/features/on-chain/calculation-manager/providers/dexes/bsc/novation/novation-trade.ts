import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { NOVATION_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/novation/constants';
import { NOVATION_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/novation-abi';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class NovationTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = NOVATION_ABI;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.NOVATION;
    }

    public readonly dexContractAddress = NOVATION_CONTRACT_ADDRESS;
}
