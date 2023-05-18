import { BigNumber } from 'ethers';

interface GetAmountOutParams {
    amountIn: BigNumber;
    reserveIn: BigNumber;
    reserveOut: BigNumber;
    swapFee: BigNumber;
    A?: BigNumber;
    tokenInPrecisionMultiplier?: BigNumber;
    tokenOutPrecisionMultiplier?: BigNumber;
}

const MAX_LOOP_LIMIT = 256;
const ZERO = BigNumber.from(0);

function within1(a: BigNumber, b: BigNumber): boolean {
    if (a.gt(b)) {
        return a.sub(b).lte(1);
    }
    return b.sub(a).lte(1);
}

function computeDFromAdjustedBalances(A: BigNumber, xp0: BigNumber, xp1: BigNumber): BigNumber {
    const s = xp0.add(xp1);

    if (s.isZero()) {
        return ZERO;
    }
    let prevD;
    let d = s;
    const nA = A.mul(2);
    for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
        const dP = d.mul(d).div(xp0).mul(d).div(xp1).div(4);
        prevD = d;
        d = nA
            .mul(s)
            .add(dP.mul(2))
            .mul(d)
            .div(nA.sub(1).mul(d).add(dP.mul(3)));
        if (within1(d, prevD)) {
            return d;
        }
    }
    return d;
}

const MAX_FEE = BigNumber.from(100000); // 1e5

function getY(A: BigNumber, x: BigNumber, d: BigNumber): BigNumber {
    let c = d.mul(d).div(x.mul(2));
    const nA = A.mul(2);
    c = c.mul(d).div(nA.mul(2));
    const b = x.add(d.div(nA));
    let yPrev;
    let y = d;
    for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
        yPrev = y;
        y = y.mul(y).add(c).div(y.mul(2).add(b).sub(d));
        if (within1(y, yPrev)) {
            break;
        }
    }
    return y;
}

export function getAmountOutStable(params: GetAmountOutParams): BigNumber {
    const adjustedReserveIn = params.reserveIn.mul(params.tokenInPrecisionMultiplier!);
    const adjustedReserveOut = params.reserveOut.mul(params.tokenOutPrecisionMultiplier!);
    const feeDeductedAmountIn = params.amountIn.sub(
        params.amountIn.mul(params.swapFee).div(MAX_FEE)
    );
    const d = computeDFromAdjustedBalances(params.A!, adjustedReserveIn, adjustedReserveOut);

    const x = adjustedReserveIn.add(feeDeductedAmountIn.mul(params.tokenInPrecisionMultiplier!));
    const y = getY(params.A!, x, d);
    const dy = adjustedReserveOut.sub(y).sub(1);
    return dy.div(params.tokenOutPrecisionMultiplier!);
}
