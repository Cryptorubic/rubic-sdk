import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';

export interface TxStatusData {
    status: TxStatus;
    hash: string | null;
}
