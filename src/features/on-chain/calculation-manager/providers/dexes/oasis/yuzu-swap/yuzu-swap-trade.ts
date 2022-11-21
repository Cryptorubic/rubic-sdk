import { YUZU_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/oasis/yuzu-swap/constants';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class YuzuSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.YUZU_SWAP;
    }

    public readonly dexContractAddress = YUZU_SWAP_CONTRACT_ADDRESS;
}
