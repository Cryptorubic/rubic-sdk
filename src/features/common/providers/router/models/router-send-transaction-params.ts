import { RouterQuoteResponseConfig } from './router-quote-response-config';

export interface RouterSendTransactionParams extends RouterQuoteResponseConfig {
    senderAddress: string;
    receiverAddress: string;
    refundAddress: string;
}

export interface RouterSendTransactionResponse extends RouterSendTransactionParams {
    txn: {
        value: string;
        to: string;
        data: string;
    }
}