import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { DEX_TRADER_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/constants/dex-trader/dex-trader-abi';
import { ETH_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/constants/dex-trader/dex-trader-swap-method';
import { TRADER_DFK_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/defi-kingdoms/trader-dfk/constants';

export class TradeDFKSwapTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = DEX_TRADER_ABI;

    public static readonly swapMethods = ETH_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.TRADER;
    }

    public readonly contractAddress = TRADER_DFK_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
