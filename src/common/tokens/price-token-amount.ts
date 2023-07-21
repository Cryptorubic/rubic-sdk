import BigNumber from 'bignumber.js';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { PriceToken, PriceTokenStruct } from 'src/common/tokens/price-token';
import { TokenStruct } from 'src/common/tokens/token';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

export type PriceTokenAmountStruct<T extends BlockchainName = BlockchainName> =
    PriceTokenStruct<T> & ({ weiAmount: BigNumber } | { tokenAmount: BigNumber });

export type PriceTokenAmountBaseStruct<T extends BlockchainName = BlockchainName> =
    TokenBaseStruct<T> & ({ weiAmount: BigNumber } | { tokenAmount: BigNumber });

/**
 * Contains token structure with price and amount.
 */
export class PriceTokenAmount<T extends BlockchainName = BlockchainName> extends PriceToken<T> {
    /**
     * Creates PriceTokenAmount based on token's address and blockchain.
     * @param tokenAmountBaseStruct Base token structure with amount.
     */
    public static async createToken<T extends BlockchainName = BlockchainName>(
        tokenAmountBaseStruct: PriceTokenAmountBaseStruct<T>
    ): Promise<PriceTokenAmount<T>> {
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
    public static async createFromToken<T extends BlockchainName = BlockchainName>(
        tokenAmount: TokenStruct<T> & ({ weiAmount: BigNumber } | { tokenAmount: BigNumber })
    ): Promise<PriceTokenAmount<T>> {
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
    public get asStructWithAmount(): PriceTokenAmountStruct<T> {
        return {
            ...this,
            price: this.price,
            weiAmount: this.weiAmount
        };
    }

    constructor(tokenStruct: PriceTokenAmountStruct<T>) {
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
            !this.price?.isFinite() ||
            !toToken.price?.isFinite() ||
            !this.tokenAmount?.isFinite() ||
            !toToken.tokenAmount?.isFinite() ||
            !this.price?.gt(0) ||
            !toToken.price?.gt(0)
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
