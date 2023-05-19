import { BigNumber } from 'ethers';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Cache } from 'src/common/utils/decorators';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { syncSwapStablePool } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/sync-swap-stable-pool';
import {
    ETHER,
    FOUR,
    granularity,
    MAX_FEE,
    MAX_LOOP_LIMIT,
    MAX_XP,
    ONE,
    STABLE_POOL_A,
    THREE,
    TWO,
    UINT128_MAX,
    UINT256_MAX,
    ZERO
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/constants';
import { SyncSwapPathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/sync-swap-path-factory';
import {
    BestPathsWithAmounts,
    GetAmountParams,
    GroupAmounts,
    Path,
    PathWithAmounts,
    RouteDirection,
    RoutePoolData,
    Step,
    StepWithAmount
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/typings';

export class SyncSwapRouter {
    public static async findBestAmountsForPathsExactIn(
        paths: Path[],
        amountInString: string,
        _ts?: number
    ): Promise<BestPathsWithAmounts> {
        const amountIn = BigNumber.from(amountInString);
        const pathAmounts: BigNumber[][] = await SyncSwapRouter.splitAmount(amountIn, paths.length);

        const groups: GroupAmounts[] = [];
        const groupPromises: Promise<boolean>[] = [];

        for (const amounts of pathAmounts) {
            const promise = new Promise<boolean>((resolve, reject) => {
                SyncSwapRouter.calculateGroupAmounts(paths, amounts).then(group => {
                    if (group === null) {
                        reject(new Error('expired'));
                    } else {
                        groups.push(group);
                        resolve(true);
                    }
                });
            });

            groupPromises.push(promise);
        }

        await Promise.all(groupPromises);

        let bestPathsWithAmounts: PathWithAmounts[] = [];
        let bestAmountOut: BigNumber = ZERO;
        let bestQuoteOut: BigNumber = ZERO;
        let bestPriceImpact: BigNumber | null = null;

        for (const group of groups) {
            const groupAmountOut = group.amountOut;

            if (!groupAmountOut.isZero() && !group.quoteOut.isZero()) {
                const amountLoss = group.quoteOut.sub(groupAmountOut);
                const groupPriceImpact = amountLoss.mul(ETHER).div(group.quoteOut);

                if (bestPriceImpact === null || groupPriceImpact.lt(bestPriceImpact)) {
                    bestPriceImpact = groupPriceImpact;
                }

                if (groupAmountOut.gt(bestAmountOut)) {
                    bestPathsWithAmounts = group.pathsWithAmounts;
                    bestAmountOut = groupAmountOut;
                    bestQuoteOut = group.quoteOut;
                }
            }
        }

        return {
            found: bestAmountOut !== null,
            direction: RouteDirection.EXACT_IN,
            pathsWithAmounts: bestPathsWithAmounts,
            amountIn,
            amountOut: bestAmountOut,
            quote: bestQuoteOut,
            bestPriceImpact,
            gas: ZERO
        };
    }

    private static copyStep(step: Step): Step {
        const pool: RoutePoolData = step.pool;

        return {
            pool: {
                isAlpha: pool.isAlpha,
                vault: pool.vault,
                pool: pool.pool,
                tokenA: pool.tokenA,
                tokenB: pool.tokenB,
                poolType: pool.poolType,
                reserveA: BigNumber.from(pool.reserveA),
                reserveB: BigNumber.from(pool.reserveB),
                swapFeeAB: pool.swapFeeAB,
                swapFeeBA: pool.swapFeeBA
            },
            tokenIn: step.tokenIn,
            swapFee: step.swapFee
        };
    }

    private static getAmountOutClassic(params: GetAmountParams, checkOverflow: boolean): BigNumber {
        const amountIn = params.amount;
        const reserveIn = params.reserveIn;
        if (checkOverflow && reserveIn.add(amountIn).gt(UINT128_MAX)) {
            throw Error('overflow');
        }

        const amountInWithFee = amountIn.mul(MAX_FEE.sub(params.swapFee));
        if (checkOverflow && amountInWithFee.gt(UINT256_MAX)) {
            throw Error('overflow');
        }

        const numerator = amountInWithFee.mul(params.reserveOut);
        if (checkOverflow && numerator.gt(UINT256_MAX)) {
            throw Error('overflow');
        }

        const denominator = params.reserveIn.mul(MAX_FEE).add(amountInWithFee);
        if (checkOverflow && denominator.gt(UINT256_MAX)) {
            throw Error('overflow');
        }

        return numerator.div(denominator);
    }

    public static computeDFromAdjustedBalances(
        A: BigNumber,
        xp0: BigNumber,
        xp1: BigNumber,
        checkOverflow: boolean
    ): BigNumber {
        const s = xp0.add(xp1);

        if (s.isZero()) {
            return ZERO;
        }
        let prevD;
        let d = s;
        const nA = A.mul(TWO);

        for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
            const dSq = d.mul(d);

            if (checkOverflow && dSq.gt(UINT256_MAX)) {
                throw Error('overflow');
            }

            const d2 = dSq.div(xp0).mul(d);
            if (checkOverflow && d2.gt(UINT256_MAX)) {
                throw Error('overflow');
            }

            const dP = d2.div(xp1).div(FOUR);
            prevD = d;

            const d0 = nA.mul(s).add(dP.mul(TWO)).mul(d);
            if (checkOverflow && d0.gt(UINT256_MAX)) {
                throw Error('overflow');
            }

            d = d0.div(nA.sub(ONE).mul(d).add(dP.mul(THREE)));

            if (d.sub(prevD).abs().lte(ONE)) {
                return d;
            }
        }

        return d;
    }

    public static getY(A: BigNumber, x: BigNumber, d: BigNumber): BigNumber {
        const nA = A.mul(TWO);

        const c = d.mul(d).div(x.mul(TWO)).mul(d).div(nA.mul(TWO));

        const b = d.div(nA).add(x);

        let yPrev;
        let y = d;

        for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
            yPrev = y;
            y = y.mul(y).add(c).div(y.mul(TWO).add(b).sub(d));

            if (y.sub(yPrev).abs().lte(ONE)) {
                break;
            }
        }

        return y;
    }

    private static getAmountOutStable(params: GetAmountParams, checkOverflow: boolean): BigNumber {
        const adjustedReserveIn = params.reserveIn.mul(params.tokenInPrecisionMultiplier!);
        if (checkOverflow && adjustedReserveIn.gt(MAX_XP)) {
            throw Error('overflow');
        }
        const adjustedReserveOut = params.reserveOut.mul(params.tokenOutPrecisionMultiplier!);
        if (checkOverflow && adjustedReserveOut.gt(MAX_XP)) {
            throw Error('overflow');
        }

        const amountIn = params.amount;
        const feeDeductedAmountIn = amountIn.sub(amountIn.mul(params.swapFee).div(MAX_FEE));
        const d = SyncSwapRouter.computeDFromAdjustedBalances(
            STABLE_POOL_A,
            adjustedReserveIn,
            adjustedReserveOut,
            checkOverflow
        );

        const x = adjustedReserveIn.add(
            feeDeductedAmountIn.mul(params.tokenInPrecisionMultiplier!)
        );
        const y = SyncSwapRouter.getY(STABLE_POOL_A, x, d);
        const dy = adjustedReserveOut.sub(y).sub(1);

        return dy.div(params.tokenOutPrecisionMultiplier!);
    }

    private static calculateAmountOut(params: GetAmountParams, checkOverflow: boolean): BigNumber {
        if (params.amount.isZero()) {
            return ZERO;
        }

        let amountOut;
        try {
            if (params.stable) {
                amountOut = SyncSwapRouter.getAmountOutStable(params, checkOverflow);
            } else {
                amountOut = SyncSwapRouter.getAmountOutClassic(params, checkOverflow);
            }
        } catch (error: unknown) {
            return ZERO;
        }

        return amountOut;
    }

    private static splitAmounts2(amount: BigNumber, granularity: number): BigNumber[][] {
        const oneSplit = amount.div(granularity);
        if (oneSplit.isZero()) {
            return [];
        }

        const amounts: BigNumber[][] = [];

        for (let i = 0; i <= granularity; i++) {
            const a = oneSplit.mul(i);
            const b = oneSplit.mul(granularity - i);

            amounts.push([a, b]);
        }

        return amounts;
    }

    private static splitAmounts3(amount: BigNumber, granularity: number): BigNumber[][] {
        const oneSplit = amount.div(granularity);
        if (oneSplit.isZero()) {
            return [];
        }

        const amounts: BigNumber[][] = [];

        for (let i = 0; i <= granularity; i++) {
            const a = oneSplit.mul(i);

            const remaining = granularity - i;
            for (let j = 0; j <= remaining; j++) {
                const b = oneSplit.mul(j);
                const c = oneSplit.mul(remaining - j);

                amounts.push([a, b, c]);
            }
        }

        return amounts;
    }

    private static splitAmounts4(amount: BigNumber, granularity: number): BigNumber[][] {
        const oneSplit = amount.div(granularity);
        if (oneSplit.isZero()) {
            return [];
        }

        const amounts: BigNumber[][] = [];

        for (let i = 0; i <= granularity; i++) {
            const a = oneSplit.mul(i);

            const remaining = granularity - i;
            for (let j = 0; j <= remaining; j++) {
                const b = oneSplit.mul(j);

                const remaining2 = remaining - j;
                for (let k = 0; k <= remaining2; k++) {
                    const c = oneSplit.mul(k);
                    const d = oneSplit.mul(remaining2 - k);

                    amounts.push([a, b, c, d]);
                }
            }
        }

        return amounts;
    }

    private static splitAmounts5(amount: BigNumber, granularity: number): BigNumber[][] {
        const oneSplit = amount.div(granularity);
        if (oneSplit.isZero()) {
            return [];
        }

        const amounts: BigNumber[][] = [];

        for (let i = 0; i <= granularity; i++) {
            const a = oneSplit.mul(i);

            const remaining = granularity - i;
            for (let j = 0; j <= remaining; j++) {
                const b = oneSplit.mul(j);

                const remaining2 = remaining - j;
                for (let k = 0; k <= remaining2; k++) {
                    const c = oneSplit.mul(k);

                    const remaining3 = remaining2 - k;
                    for (let l = 0; l <= remaining3; l++) {
                        const d = oneSplit.mul(l);
                        const e = oneSplit.mul(remaining3 - l);

                        amounts.push([a, b, c, d, e]);
                    }
                }
            }
        }

        return amounts;
    }

    private static fixSplitAmounts(amount: BigNumber, amounts: BigNumber[][]): BigNumber[][] {
        for (const group of amounts) {
            let sum: BigNumber = ZERO;

            for (const amount of group) {
                sum = sum.add(amount);
            }

            if (!sum.eq(amount)) {
                const diff: BigNumber = amount.sub(sum);

                for (const amount of group) {
                    // only add diff to non-zero amount
                    if (!amount.isZero()) {
                        group[0] = group[0]!.add(diff);
                        break;
                    }
                }
            }
        }

        return amounts;
    }

    private static async splitAmount(amount: BigNumber, parts: number): Promise<BigNumber[][]> {
        if (parts === 0) {
            return [];
        }

        if (parts === 1) {
            return [[amount]];
        }

        if (parts === 2) {
            return SyncSwapRouter.fixSplitAmounts(
                amount,
                SyncSwapRouter.splitAmounts2(amount, granularity)
            );
        }

        if (parts === 3) {
            return SyncSwapRouter.fixSplitAmounts(
                amount,
                SyncSwapRouter.splitAmounts3(amount, granularity)
            );
        }

        if (parts === 4) {
            return SyncSwapRouter.fixSplitAmounts(
                amount,
                SyncSwapRouter.splitAmounts4(amount, granularity)
            );
        }

        if (parts === 5) {
            return SyncSwapRouter.fixSplitAmounts(
                amount,
                SyncSwapRouter.splitAmounts5(amount, granularity)
            );
        }

        throw Error('Unsupported split parts');
    }

    private static async calculateAmountOutForStep(
        step: Step,
        amountIn: BigNumber,
        quoteIn: BigNumber
    ): Promise<[BigNumber, BigNumber, Step | null]> {
        const isTokenAIn = step.pool.tokenA === step.tokenIn;
        const [reserveIn, reserveOut] = isTokenAIn
            ? [step.pool.reserveA, step.pool.reserveB]
            : [step.pool.reserveB, step.pool.reserveA];

        let tokenInPrecisionMultiplier: BigNumber;
        let tokenOutPrecisionMultiplier: BigNumber;

        // create multiplier for stable pools
        const stable = step.pool.poolType === '2';
        if (stable) {
            const [tokenInAddress] = isTokenAIn
                ? [step.pool.tokenA, step.pool.tokenB]
                : [step.pool.tokenB, step.pool.tokenA];
            const { fromPrecisionMultiplier, toPrecisionMultiplier } = await this.getPoolPrecision(
                step.pool.pool,
                tokenInAddress
            );

            tokenInPrecisionMultiplier = BigNumber.from(fromPrecisionMultiplier);
            tokenOutPrecisionMultiplier = BigNumber.from(toPrecisionMultiplier);
        } else {
            tokenInPrecisionMultiplier = ZERO;
            tokenOutPrecisionMultiplier = ZERO;
        }

        const swapFee = BigNumber.from(step.swapFee); // wrap
        const amountOut = SyncSwapRouter.calculateAmountOut(
            {
                stable,
                amount: amountIn,
                reserveIn,
                reserveOut,
                swapFee,
                tokenInPrecisionMultiplier,
                tokenOutPrecisionMultiplier
            },
            true
        );

        let quoteOut: BigNumber = ZERO;
        let updatedStep: Step | null = null;
        if (!amountOut.isZero()) {
            updatedStep = SyncSwapRouter.copyStep(step);
            if (isTokenAIn) {
                updatedStep.pool.reserveA = step.pool.reserveA.add(amountIn);
                updatedStep.pool.reserveB = step.pool.reserveB.sub(amountOut);
            } else {
                updatedStep.pool.reserveB = step.pool.reserveB.add(amountIn);
                updatedStep.pool.reserveA = step.pool.reserveA.sub(amountOut);
            }

            quoteOut = SyncSwapPathFactory.calculateQuoteOut({
                stable,
                amount: quoteIn,
                reserveIn,
                reserveOut,
                swapFee,
                tokenInPrecisionMultiplier,
                tokenOutPrecisionMultiplier
            });
        }

        return [amountOut, quoteOut, updatedStep];
    }

    public static async calculatePathAmountsByInput(
        path: Path,
        amountIn: BigNumber,
        _updateReserves: boolean
    ): Promise<PathWithAmounts | null> {
        const stepsWithAmount: StepWithAmount[] = [];
        let amountInNext: BigNumber = amountIn;
        let quoteInNext: BigNumber = amountIn;

        for (let i = 0; i < path.length; i++) {
            const step: Step = path[i]!;

            const [stepAmountOut, stepQuoteOut, updatedStep] =
                // eslint-disable-next-line no-await-in-loop
                await SyncSwapRouter.calculateAmountOutForStep(step, amountInNext, quoteInNext);

            if (stepAmountOut.isZero()) {
                return null;
            }
            stepsWithAmount.push({
                ...step,
                updatedStep,
                amountIn: amountInNext
            });

            amountInNext = stepAmountOut;
            quoteInNext = stepQuoteOut;
        }

        const pathAmountOut = amountInNext;
        const pathQuoteOut = quoteInNext;

        return {
            direction: RouteDirection.EXACT_IN,
            stepsWithAmount,
            amountOut: pathAmountOut,
            amountIn,
            quote: pathQuoteOut
        };
    }

    private static async calculateGroupAmounts(
        paths: Path[],
        amounts: BigNumber[]
    ): Promise<GroupAmounts | null> {
        const pathsWithAmounts: PathWithAmounts[] = [];
        let amountOut: BigNumber = ZERO;
        let quoteOut: BigNumber = ZERO;
        const groupPaths = paths;

        const lastSteps: Map<string, Step> = new Map();

        for (let i = 0; i < groupPaths.length; i++) {
            const pathAmountIn: BigNumber = amounts[i]!;
            if (pathAmountIn.isZero()) {
                // eslint-disable-next-line no-continue
                continue;
            }

            const path: Path = groupPaths[i]!;

            for (let j = 0; j < path.length; j++) {
                const lastStep: Step | undefined = lastSteps.get(path[j]!.pool.pool);
                if (lastStep !== undefined) {
                    path[j] = SyncSwapRouter.copyStep(lastStep);
                }
            }

            const pathWithAmounts: PathWithAmounts | null =
                // eslint-disable-next-line no-await-in-loop
                await SyncSwapRouter.calculatePathAmountsByInput(path, pathAmountIn, true);

            if (pathWithAmounts != null) {
                for (const step of pathWithAmounts.stepsWithAmount) {
                    if (step.updatedStep !== null) {
                        lastSteps.set(step.pool.pool, step.updatedStep);
                    }
                }

                pathsWithAmounts.push(pathWithAmounts);
                amountOut = amountOut.add(pathWithAmounts.amountOut);
                quoteOut = quoteOut.add(pathWithAmounts.quote);
            }
        }

        return {
            pathsWithAmounts,
            amountOut,
            quoteOut
        };
    }

    @Cache
    private static async getPoolPrecision(
        address: string,
        fromAddress: string
    ): Promise<{ fromPrecisionMultiplier: string; toPrecisionMultiplier: string }> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZK_SYNC);

        const token0 = await web3Public.callContractMethod(
            address,
            syncSwapStablePool,
            'token0',
            []
        );
        const token0PM = await web3Public.callContractMethod(
            address,
            syncSwapStablePool,
            'token0PrecisionMultiplier',
            []
        );
        const token1PM = await web3Public.callContractMethod(
            address,
            syncSwapStablePool,
            'token1PrecisionMultiplier',
            []
        );
        return compareAddresses(token0, fromAddress)
            ? {
                  fromPrecisionMultiplier: token0PM,
                  toPrecisionMultiplier: token1PM
              }
            : {
                  fromPrecisionMultiplier: token1PM,
                  toPrecisionMultiplier: token0PM
              };
    }
}
