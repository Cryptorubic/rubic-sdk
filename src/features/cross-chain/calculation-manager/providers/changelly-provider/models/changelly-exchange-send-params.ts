export interface ChangellyExchangeSendParams {
    from: string;
    to: string;
    amountFrom: string;
    rateId: string;
    address: string;
    refundAddress?: string;
}
