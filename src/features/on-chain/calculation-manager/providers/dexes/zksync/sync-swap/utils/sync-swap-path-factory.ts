import { BigNumber } from 'ethers';
import {
    computeDFromAdjustedBalances,
    getY
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/route-utils';

// import {
//     computeDFromAdjustedBalances,
//     getY
// } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/route-utils';
import { MAX_FEE, STABLE_POOL_A, ZERO } from './constants';
import { GetAmountParams, Path, RoutePoolData, Step } from './typings';

interface StepData {
    pool: RoutePoolData;
    tokenIn: string;
}

export class SyncSwapPathFactory {
    private static getQuoteOutStable(params: GetAmountParams): BigNumber {
        const multiplier = 10000;

        const adjustedReserveIn = params.reserveIn
            .mul(params.tokenInPrecisionMultiplier!)
            .mul(multiplier);
        const adjustedReserveOut = params.reserveOut
            .mul(params.tokenOutPrecisionMultiplier!)
            .mul(multiplier);

        const amountIn = params.amount;
        const feeDeductedAmountIn = amountIn.sub(amountIn.mul(params.swapFee).div(MAX_FEE));

        const d = computeDFromAdjustedBalances(
            STABLE_POOL_A,
            adjustedReserveIn,
            adjustedReserveOut,
            false
        );

        const x = adjustedReserveIn.add(
            feeDeductedAmountIn.mul(params.tokenInPrecisionMultiplier!)
        );
        const y = getY(STABLE_POOL_A, x, d);
        const dy = adjustedReserveOut.sub(y).sub(1);

        return dy.div(params.tokenOutPrecisionMultiplier!);
    }

    private static getQuoteOutClassic(params: GetAmountParams): BigNumber {
        const amountIn = params.amount;
        const multiplier = 100000;

        const amountInWithFee = amountIn.mul(MAX_FEE.sub(params.swapFee));
        return amountInWithFee
            .mul(params.reserveOut.mul(multiplier))
            .div(params.reserveIn.mul(multiplier).mul(MAX_FEE));
    }

    public static calculateQuoteOut(params: GetAmountParams): BigNumber {
        if (params.amount.isZero()) {
            return ZERO;
        }

        return params.stable
            ? SyncSwapPathFactory.getQuoteOutStable(params)
            : SyncSwapPathFactory.getQuoteOutClassic(params);
    }

    public static createPath(stepDataArray: StepData[]): Path {
        const steps: Step[] = [];

        for (let i = 0; i < stepDataArray.length; i++) {
            const data: StepData = stepDataArray[i]!;
            const pool: RoutePoolData = data.pool;

            // Shhh....
            const step: Step = {
                pool,
                tokenIn: data.tokenIn,
                swapFee: String(data.tokenIn === pool.tokenA ? pool.swapFeeAB : pool.swapFeeBA)
            };

            steps.push(step);
        }

        return steps;
    }
}
