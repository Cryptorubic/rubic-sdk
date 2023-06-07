import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { PULSEX_V2_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/pulsex-v2/constants';

export class PulseXV2Trade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PULSEX_V2;
    }

    public readonly dexContractAddress = PULSEX_V2_CONTRACT_ADDRESS;
}
