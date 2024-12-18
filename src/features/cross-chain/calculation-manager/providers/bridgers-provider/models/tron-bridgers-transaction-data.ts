import { TronParameters } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-parameters';

export interface TronBridgersTransactionData {
    functionName: string;
    options: {
        feeLimit: number;
        callValue: number;
    };
    parameter: TronParameters;
    to: string;
}
