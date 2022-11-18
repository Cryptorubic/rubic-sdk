import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { PHOTON_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/photon-swap/constants';

export class PhotonSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PHOTON_SWAP;
    }

    public readonly contractAddress = PHOTON_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
