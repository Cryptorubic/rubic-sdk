import { XyEstimationResponse } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-estimation-response';

/**
 * Swap transaction response.
 */
export interface XyTransactionResponse extends XyEstimationResponse {
    /**
     * Transaction data.
     */
    tx: {
        to: string;
        data: string;
        value: string;
    } | null;

    /**
     * Receiver address;
     */
    receiveAddress: string | null;
}
