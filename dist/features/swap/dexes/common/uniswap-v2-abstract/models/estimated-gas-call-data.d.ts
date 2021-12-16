import { BatchCall } from '@core/blockchain/web3-public/models/batch-call';
import BigNumber from 'bignumber.js';
export interface EstimatedGasCallData {
    callData: BatchCall;
    defaultGasLimit: BigNumber;
}
