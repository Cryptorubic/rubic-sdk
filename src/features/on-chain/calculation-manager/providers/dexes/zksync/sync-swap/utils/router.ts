import { BigNumber } from 'ethers';
import {
    ETHER,
    ZERO
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/constants';
import {
    calculateGroupAmounts,
    splitAmount
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/route-utils';
import {
    BestPathsWithAmounts,
    GroupAmounts,
    Path,
    PathWithAmounts,
    RouteDirection
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/typings';

export async function findBestAmountsForPathsExactIn(
    paths: Path[],
    amountInString: string,
    _ts?: number
): Promise<BestPathsWithAmounts> {
    const amountIn = BigNumber.from(amountInString);
    const pathAmounts: BigNumber[][] = await splitAmount(amountIn, paths.length);

    const groups: GroupAmounts[] = [];
    const groupPromises: Promise<boolean>[] = [];

    // for each amount group
    for (const amounts of pathAmounts) {
        const promise = new Promise<boolean>((resolve, reject) => {
            calculateGroupAmounts(paths, amounts).then(group => {
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
                // set as best if has more output
                bestPathsWithAmounts = group.pathsWithAmounts;
                bestAmountOut = groupAmountOut;
                bestQuoteOut = group.quoteOut;
            }
        }
    }

    const found = bestAmountOut !== null;

    const gas: BigNumber = ZERO;
    // if (found) {
    //     gas = GAS_SWAP_BASE;
    //
    //     for (let i = 0; i < bestPathsWithAmounts.length; i++) {
    //         const path: PathWithAmounts = bestPathsWithAmounts[i];
    //
    //         if (i !== 0) {
    //             // more than 1 paths
    //             gas = gas.add(GAS_EXTRA_PATH);
    //         }
    //
    //         for (const step of path.stepsWithAmount) {
    //             // add gas for all steps
    //             gas = gas.add(step.pool.poolType === 1 ? GAS_CLASSIC_STEP : GAS_STABLE_STEP);
    //         }
    //     }
    // } else {
    //     gas = ZERO;
    // }

    return {
        found,
        direction: RouteDirection.EXACT_IN,
        pathsWithAmounts: bestPathsWithAmounts,
        amountIn,
        amountOut: bestAmountOut,
        quote: bestQuoteOut,
        bestPriceImpact,
        gas
    };
}
