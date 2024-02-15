import {
    DlnTokenAmount,
    DlnTokenMinAmount
} from 'src/features/common/providers/dln/models/dln-estimation';

export interface DlnOnChainSwapResponse<T> {
    tokenIn: DlnTokenAmount;
    tokenOut: DlnTokenMinAmount;
    tx: {
        data: string;
        to?: string;
    } & T;
}
