import { BaseToken } from '@lifi/sdk';
import {
    DlnMaxTheoreticalAmountToken,
    DlnTokenMinAmount
} from 'src/features/common/providers/dln/models/dln-estimation';

/**
 * Estimation object.
 */
export interface Estimation {
    readonly costsDetails: {
        payload: {
            feeAmount: string;
        };
        type: string;
        amountIn: string;
        amountOut: string;
        tokenIn: string;
        tokenOut: string;
        chain: string;
    }[];
    /**
     * Source chain token in.
     */
    readonly srcChainTokenIn: DlnTokenMinAmount;

    /**
     * Source chain token out.
     */
    readonly srcChainTokenOut: DlnTokenMinAmount;

    /**
     * Destination chain token out.
     */
    readonly dstChainTokenOut: DlnMaxTheoreticalAmountToken;

    /**
     *  Details of the token representing execution fee currency, a recommended amount
     *  calculated by the planner, and an actual amount used during route construction.
     */
    readonly executionFee: {
        token: BaseToken;
        recommendedAmount: string;
        actualAmount: string;
    };
}

/**
 * Swap estimates response.
 */
export interface EstimationResponse<T> {
    /**
     * Trade estimation object.
     */
    estimation: Estimation;

    /**
     * Provider fee.
     */
    fixFee: string;

    /**
     * Transaction data.
     */
    tx: T;
}
