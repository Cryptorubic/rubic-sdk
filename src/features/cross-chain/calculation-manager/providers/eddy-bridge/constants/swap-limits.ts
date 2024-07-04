import BigNumber from 'bignumber.js';

import { EddyBridgeSupportedTokens } from './eddy-bridge-supported-chains';

interface EddySupportedChainLimit {
    min: BigNumber;
    max: BigNumber;
}

export const EDDY_BRIDGE_LIMITS: Record<EddyBridgeSupportedTokens, EddySupportedChainLimit> = {
    BNB: {
        min: new BigNumber(0.002),
        max: new BigNumber(15)
    },
    ETH: {
        min: new BigNumber(0.0005),
        max: new BigNumber(5)
    },
    ZETA: {
        min: new BigNumber(1),
        max: new BigNumber(15_000)
    }
};