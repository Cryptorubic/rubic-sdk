import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import BigNumber from 'bignumber.js';
import { TokenStruct } from '@core/blockchain/tokens/token';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';

export type PriceTokenAmountStruct = ConstructorParameters<typeof PriceToken>[number] &
    (
        | {
              weiAmount: BigNumber;
          }
        | {
              tokenAmount: BigNumber;
          }
    );

export type PriceTokenAmountBaseStruct = TokenBaseStruct &
    ({ weiAmount: BigNumber } | { tokenAmount: BigNumber });

export class PriceTokenAmount extends PriceToken {
    public static async createToken(
        tokenAmountBaseStruct: PriceTokenAmountBaseStruct
    ): Promise<PriceTokenAmount> {
        const token = await super.createToken(tokenAmountBaseStruct);
        return new PriceTokenAmount({
            ...tokenAmountBaseStruct,
            ...token.asStruct
        });
    }

    public static async createFromToken(
        tokenAmount: TokenStruct & ({ weiAmount: BigNumber } | { tokenAmount: BigNumber })
    ): Promise<PriceTokenAmount> {
        const priceToken = await super.createFromToken(tokenAmount);
        return new PriceTokenAmount({
            ...tokenAmount,
            price: priceToken.price
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

    public get asStruct(): PriceTokenAmountStruct {
        return {
            ...this,
            price: this.price
        };
    }

    constructor(tokenStruct: PriceTokenAmountStruct) {
        super(tokenStruct);
        if ('weiAmount' in tokenStruct) {
            this._weiAmount = new BigNumber(tokenStruct.weiAmount);
        } else {
            this._weiAmount = new BigNumber(
                Web3Pure.toWei(tokenStruct.tokenAmount, tokenStruct.decimals)
            );
        }
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

    public calculatePriceImpactPercent(toToken: PriceTokenAmount): number | null {
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
        const impact = fromTokenCost
            .minus(toTokenCost)
            .dividedBy(fromTokenCost)
            .multipliedBy(100)
            .dp(2, BigNumber.ROUND_HALF_UP)
            .toNumber();

        return impact > 0 ? impact : 0;
    }
}
