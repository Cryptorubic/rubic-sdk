import BigNumber from 'bignumber.js';

import { OrbiterResponse } from './orbiter-api-common-types';

export type OrbiterQuoteResponse = OrbiterResponse<{
    receiveAmount: string;
    router: OrbiterQuoteConfig;
}>;

export type OrbiterQuoteConfigsResponse = OrbiterResponse<OrbiterQuoteConfig[]>;

export interface OrbiterGetToAmountParams {
    fromAmount: BigNumber;
    config: OrbiterQuoteConfig;
    fromDecimals: number;
}

export interface OrbiterQuoteConfig {
    line: string;
    endpoint: string;
    endpointContract: string | null;
    srcChain: string;
    tgtChain: string;
    srcToken: string;
    tgtToken: string;
    maxAmt: string;
    minAmt: string;
    tradeFee: string;
    withholdingFee: string;
    vc: string;
    state: string;
    compRatio: number;
    spentTime: number;
}
