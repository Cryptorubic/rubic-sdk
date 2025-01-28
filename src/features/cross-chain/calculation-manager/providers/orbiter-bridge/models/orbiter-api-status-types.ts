import { OrbiterOpTxStatus, OrbiterResponse, OrbiterTxStatus } from './orbiter-api-common-types';
import { OrbiterQuoteConfig } from './orbiter-api-quote-types';

export type OrbiterStatusResponse = OrbiterResponse<{
    chainId: string;
    hash: string;
    sender: string;
    receiver: string;
    amount: string;
    symbol: string;
    timestamp: string;
    status: OrbiterTxStatus;
    opStatus: OrbiterOpTxStatus;
    /* destination status tx-hash */
    targetId: string;
    targetAmount: string;
    targetSymbol: string;
    targetChain: string;
}>;

export interface OrbiterReceiveAmountResponse {
    result: {
        receiveAmount: string;
        tradeFeeAmount: string;
        router: OrbiterQuoteConfig;
    };
}
