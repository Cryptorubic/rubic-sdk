import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';

export const RANGO_TRADE_BRIDGE_TYPE: Partial<Record<string, BridgeType>> = {
    'AnySwap Aggregator': BRIDGE_TYPE.ANY_SWAP,
    AnySwap: BRIDGE_TYPE.ANY_SWAP,
    Across: BRIDGE_TYPE.ACROSS,
    'CBridge Aggregator': BRIDGE_TYPE.CELER,
    'cBridge v2.0': BRIDGE_TYPE.CELER,
    'Arbitrum Bridge': BRIDGE_TYPE.ARBITRUM_BRIDGE,
    'Avalanche Bridge': BRIDGE_TYPE.AVALANCHE_BRIDGE,
    OpenOcean: BRIDGE_TYPE.OPEN_OCEAN,
    Hop: BRIDGE_TYPE.HOP,
    Hyphen: BRIDGE_TYPE.HYPHEN,
    'Optimism Bridge': BRIDGE_TYPE.OPTIMISM_GATEWAY,
    stargate: BRIDGE_TYPE.STARGATE,
    Symbiosis: BRIDGE_TYPE.SYMBIOSIS
};
