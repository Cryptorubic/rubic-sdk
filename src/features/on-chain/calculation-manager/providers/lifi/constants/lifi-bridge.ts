import { LifiBridgeTypes } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-bridge-types';
import { LIFI_BRIDGE_TYPES } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-bridge-types';

export const lifiBridge: Record<string, LifiBridgeTypes> = {
    across: LIFI_BRIDGE_TYPES.ACROSS,
    connext: LIFI_BRIDGE_TYPES.CONNEXT,
    arbitrum: LIFI_BRIDGE_TYPES.ARBITRUM,
    avalanche: LIFI_BRIDGE_TYPES.AVALANCHE,
    cbridge: LIFI_BRIDGE_TYPES.CBRIDGE,
    hop: LIFI_BRIDGE_TYPES.HOP,
    hyphen: LIFI_BRIDGE_TYPES.HYPHEN,
    multichain: LIFI_BRIDGE_TYPES.MULTICHAIN,
    stargate: LIFI_BRIDGE_TYPES.STARGATE,
    allbridge: LIFI_BRIDGE_TYPES.ALLBRIDGE,
    polygon: LIFI_BRIDGE_TYPES.POLYGON_BRIDGE,
    omni: LIFI_BRIDGE_TYPES.OMNI_BRIDGE,
    gnosis: LIFI_BRIDGE_TYPES.GNOSIS_BRIDGE,
    amarok: LIFI_BRIDGE_TYPES.CONNEXT_AMAROK,
    celercircle: LIFI_BRIDGE_TYPES.CIRCLE_CELER_BRIDGE,
    lifuel: LIFI_BRIDGE_TYPES.LI_FUEL,
    portal: LIFI_BRIDGE_TYPES.POLYGON_BRIDGE,
    celerim: LIFI_BRIDGE_TYPES.CELERIM
};
