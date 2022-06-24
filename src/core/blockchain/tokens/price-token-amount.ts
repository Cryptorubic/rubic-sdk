import { TokenBaseStruct } from '@rsdk-core/blockchain/models/token-base-struct';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import BigNumber from 'bignumber.js';
import { TokenStruct } from '@rsdk-core/blockchain/tokens/token';
import { Web3Pure } from '@rsdk-core/blockchain/web3-pure/web3-pure';

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

/**
 * Contains token structure with price and amount.
 */
export class PriceTokenAmount extends PriceToken {
    /**
     * Creates PriceTokenAmount based on token's address and blockchain.
     * @param tokenAmountBaseStruct Base token structure with amount.
     */
    public static async createToken(
        tokenAmountBaseStruct: PriceTokenAmountBaseStruct
    ): Promise<PriceTokenAmount> {
        const token = await super.createToken(tokenAmountBaseStruct);
        return new PriceTokenAmount({
            ...tokenAmountBaseStruct,
            ...token.asStruct
        });
    }

    /**
     * Creates PriceTokenAmount, fetching token's price.
     * @param tokenAmount Token structure with amount.
     */
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

    /**
     * Gets set amount in wei.
     */
    get weiAmount(): BigNumber {
        return new BigNumber(this._weiAmount);
    }

    /**
     * Gets set amount in wei and converted to string.
     */
    get stringWeiAmount(): string {
        return this._weiAmount.toFixed(0);
    }

    /**
     * Gets set amount with decimals.
     */
    get tokenAmount(): BigNumber {
        return new BigNumber(this._weiAmount).div(new BigNumber(10).pow(this.decimals));
    }

    /**
     * Serializes priceTokenAmount to struct object.
     */
    public get asStructWithAmount(): PriceTokenAmountStruct {
        return {
            ...this,
            price: this.price,
            weiAmount: this.weiAmount
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

    /**
     * Returns wei amount decreased by (1 - slippage) times.
     * @param slippage Slippage in range from 0 to 1.
     */
    public weiAmountMinusSlippage(slippage: number): BigNumber {
        return new BigNumber(this._weiAmount).multipliedBy(new BigNumber(1).minus(slippage));
    }

    /**
     * Returns wei amount increased by (1 - slippage) times.
     * @param slippage Slippage in range from 0 to 1.
     */
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

    /**
     * Calculates trade price impact percent if instance token is selling token, and parameter is buying token.
     * If selling usd amount is less than buying usd amount, returns 0.
     * @param toToken Token to buy.
     */
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
