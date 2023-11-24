export type XyQuoteErrorCode =
    | '10000'
    | '10001'
    | '20001'
    | '20003'
    | '20004'
    | '20005'
    | '20006'
    | '20007'
    | '20008'
    | '30001'
    | '30002'
    | '30003'
    | '30004'
    | '30005'
    | '30006';

export interface XyQuoteErrorResponse {
    success: boolean;
    errorCode: XyQuoteErrorCode;
    errorMsg: string;
}
