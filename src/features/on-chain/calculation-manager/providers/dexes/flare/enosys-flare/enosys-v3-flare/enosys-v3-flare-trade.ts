import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from '../../../../common/models/on-chain-trade-type';
import { UniswapV3AbstractTrade } from '../../../common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import {
    ENOSYS_V3_SWAP_ROUTER_CONTRACT_ABI,
    ENOSYS_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from './constants/enosys-v3-flare-swap-router-data';

export class EnosysV3FlareTrade extends UniswapV3AbstractTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ENOSYS_V3;
    }

    public readonly dexContractAddress = ENOSYS_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = ENOSYS_V3_SWAP_ROUTER_CONTRACT_ABI;
}
