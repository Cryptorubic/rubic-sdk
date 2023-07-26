import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';

type MultichainStatus = 0 | 3 | 8 | 9 | 10 | 12 | 14;

export const MULTICHAIN_STATUS_MAPPING: Record<MultichainStatus, TxStatus> = {
    0: TX_STATUS.PENDING,
    3: TX_STATUS.FAIL,
    8: TX_STATUS.PENDING,
    9: TX_STATUS.PENDING,
    10: TX_STATUS.SUCCESS,
    12: TX_STATUS.PENDING,
    14: TX_STATUS.FAIL
} as const;
