import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';

type MultichainStatus = 0 | 3 | 8 | 9 | 10 | 12 | 14;

export const MultichainStatusMapping: Record<MultichainStatus, TxStatus> = {
    0: TxStatus.PENDING,
    3: TxStatus.FAIL,
    8: TxStatus.PENDING,
    9: TxStatus.PENDING,
    10: TxStatus.SUCCESS,
    12: TxStatus.PENDING,
    14: TxStatus.FAIL
} as const;
