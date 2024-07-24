import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export const BRIDGE_TO_DEX_MAP: Partial<Record<BridgeType, OnChainTradeType>> = {
    rango: ON_CHAIN_TRADE_TYPE.RANGO,
    symbiosis: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
    lifi: ON_CHAIN_TRADE_TYPE.LIFI,
    xy: ON_CHAIN_TRADE_TYPE.XY_DEX
};
