import { RubicSdkError } from 'src/common/errors';

export const TONAPI_TX_STATUS = {
    SUCCESS: 'SUCCESS',
    ABORTED: 'ABORTED',
    DESTROYED: 'DESTROYED',
    PENDING: 'PENDING',
    // custom status
    TIMEOUT: 'TIMEOUT'
} as const;

export type TonApiTxStatus = (typeof TONAPI_TX_STATUS)[keyof typeof TONAPI_TX_STATUS];

export const TONAPI_STATUS_ERROR_MAP: Record<
    Exclude<TonApiTxStatus, 'PENDING' | 'SUCCESS'>,
    RubicSdkError
> = {
    [TONAPI_TX_STATUS.ABORTED]: new RubicSdkError('[Custom] TON transaction is aborted!'),
    [TONAPI_TX_STATUS.DESTROYED]: new RubicSdkError('[Custom] TON transaction is destroyed!'),
    [TONAPI_TX_STATUS.TIMEOUT]: new RubicSdkError('[Custom] TON transaction timeout expired!')
};
