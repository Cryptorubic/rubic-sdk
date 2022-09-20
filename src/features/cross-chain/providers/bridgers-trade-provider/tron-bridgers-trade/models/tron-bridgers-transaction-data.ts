import { TronParameters } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-parameters';

export interface TronBridgersTransactionData {
    tronRouterAddress: string;
    functionName: string;
    options: {
        feeLimit: number;
        callValue: string;
    };
    parameter: TronParameters;
    to: string;
}
