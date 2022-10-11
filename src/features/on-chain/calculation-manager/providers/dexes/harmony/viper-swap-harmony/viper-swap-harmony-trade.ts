import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { VIPER_SWAP_HARMONY_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/viper-swap-harmony/constants';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';

export class ViperSwapHarmonyTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.VIPER_SWAP;
    }

    protected readonly contractAddress = VIPER_SWAP_HARMONY_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
