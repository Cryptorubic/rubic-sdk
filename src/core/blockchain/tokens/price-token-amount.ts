import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import BigNumber from 'bignumber.js';

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

    public async cloneAndCreate(
        tokenStruct?: Partial<PriceTokenAmountStruct>
    ): Promise<PriceTokenAmount> {
        const priceToken = await PriceToken.prototype.cloneAndCreate.call(this, tokenStruct);
        return new PriceTokenAmount({
            ...priceToken.asStruct,
            weiAmount: this.weiAmount,
            ...tokenStruct
        });
    }

    public clone(tokenStruct?: Partial<PriceTokenAmountStruct>): PriceTokenAmount {
        return new PriceTokenAmount({ ...this, ...tokenStruct });
    }
}
