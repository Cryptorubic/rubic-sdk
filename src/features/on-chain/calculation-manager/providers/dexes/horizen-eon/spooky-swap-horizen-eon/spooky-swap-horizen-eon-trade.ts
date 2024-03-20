import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SPOOKY_SWAP_HORIZEN_EON_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/spooky-swap-horizen-eon/constants';

export class SpookySwapHorizenEonTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP;
    }

    public readonly dexContractAddress = SPOOKY_SWAP_HORIZEN_EON_CONTRACT_ADDRESS;
}
