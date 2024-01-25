import BigNumber from 'bignumber.js';

export class TokenUtils {
    public static getMinWeiAmount(weiAmount: BigNumber, slippage: number): BigNumber {
        return weiAmount.multipliedBy(new BigNumber(1).minus(slippage));
    }

    public static getMaxWeiAmount(weiAmount: BigNumber, slippage: number): BigNumber {
        return weiAmount.multipliedBy(new BigNumber(1).plus(slippage));
    }

    public static getMinWeiAmountString(weiAmount: BigNumber, slippage: number): string {
        return TokenUtils.getMinWeiAmount(weiAmount, slippage).toFixed(0);
    }

    public static getMaxWeiAmountString(weiAmount: BigNumber, slippage: number): string {
        return TokenUtils.getMaxWeiAmount(weiAmount, slippage).toFixed(0);
    }
}
