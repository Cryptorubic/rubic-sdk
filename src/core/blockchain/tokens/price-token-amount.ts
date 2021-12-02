import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import BigNumber from 'bignumber.js';
import { TokenStruct } from '@core/blockchain/tokens/token';

type PriceTokenAmountStruct = ConstructorParameters<typeof PriceToken>[number] & {
    weiAmount: BigNumber;
};

type TokenAmountBaseStruct = TokenBaseStruct & { weiAmount: BigNumber };

export class PriceTokenAmount extends PriceToken {
    public static async createToken(
        tokenAmountBaseStruct: TokenAmountBaseStruct
    ): Promise<PriceTokenAmount> {
        const token = await super.createToken(tokenAmountBaseStruct);
        return new PriceTokenAmount({
            ...token.asStruct,
            weiAmount: tokenAmountBaseStruct.weiAmount
        });
    }

    public static async createFromToken(
        tokenAmount: TokenStruct & { weiAmount: BigNumber }
    ): Promise<PriceTokenAmount> {
        const priceToken = await super.createFromToken(tokenAmount);
        return new PriceTokenAmount({
            ...priceToken.asStruct,
            weiAmount: tokenAmount.weiAmount
        });
    }

    private readonly _weiAmount: BigNumber;

    get weiAmount(): BigNumber {
        return new BigNumber(this._weiAmount);
    }

    get stringWeiAmount(): string {
        return this._weiAmount.toFixed(0);
    }

    get tokenAmount(): BigNumber {
        return new BigNumber(this._weiAmount).div(new BigNumber(10).pow(this.decimals));
    }

    constructor(tokenStruct: PriceTokenAmountStruct) {
        super(tokenStruct);
        this._weiAmount = new BigNumber(tokenStruct.weiAmount);
    }

    public weiAmountMinusSlippage(slippage: number): BigNumber {
        return new BigNumber(this._weiAmount).multipliedBy(new BigNumber(1).minus(slippage));
    }

    public weiAmountPlusSlippage(slippage: number): BigNumber {
        return new BigNumber(this._weiAmount).multipliedBy(new BigNumber(1).plus(slippage));
    }

    public calculatePriceImpact(toToken: PriceTokenAmount): number | null {
        if (
            !this.price ||
            !toToken.price ||
            !this.tokenAmount?.isFinite() ||
            !toToken.tokenAmount?.isFinite()
        ) {
            return null;
        }

        const fromTokenCost = this.tokenAmount.multipliedBy(this.price);
        const toTokenCost = toToken.tokenAmount.multipliedBy(toToken.price);
        return fromTokenCost
            .minus(toTokenCost)
            .dividedBy(fromTokenCost)
            .multipliedBy(100)
            .dp(2, BigNumber.ROUND_HALF_UP)
            .toNumber();
    }
}
