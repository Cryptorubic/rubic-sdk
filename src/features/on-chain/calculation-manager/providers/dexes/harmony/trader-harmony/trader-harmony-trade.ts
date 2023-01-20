import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { DEX_TRADER_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/dex-trader/dex-trader-abi';
import { ETH_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/dex-trader/dex-trader-swap-method';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADER_HARMONY_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/trader-harmony/constants';

export class TradeHarmonySwapTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = DEX_TRADER_ABI;

    public static readonly swapMethods = ETH_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.TRADER;
    }

    public readonly dexContractAddress = TRADER_HARMONY_CONTRACT_ADDRESS;
}
