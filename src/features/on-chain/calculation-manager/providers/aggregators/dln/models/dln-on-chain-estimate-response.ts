import {
    DlnTokenAmount,
    DlnTokenMinAmount
} from 'src/features/common/providers/dln/models/dln-estimation';

export interface DlnOnChainEstimateResponse {
    estimation: {
        tokenIn: DlnTokenAmount;
        tokenOut: DlnTokenMinAmount;
    };
}
