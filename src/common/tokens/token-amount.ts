import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import BigNumber from 'bignumber.js';
import { Token, TokenStruct } from 'src/common/tokens/token';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export type TokenAmountStruct<T extends BlockchainName = BlockchainName> = TokenStruct<T> &
    ({ weiAmount: BigNumber } | { tokenAmount: BigNumber });

export type TokenAmountBaseStruct<T extends BlockchainName = BlockchainName> = TokenBaseStruct<T> &
    ({ weiAmount: BigNumber } | { tokenAmount: BigNumber });

/**
 * Contains token structure with price and amount.
 */
export class TokenAmount<T extends BlockchainName = BlockchainName> extends Token<T> {
    /**
     * Creates PriceTokenAmount based on token's address and blockchain.
     * @param tokenAmountBaseStruct Base token structure with amount.
     */
    public static async createToken<T extends BlockchainName = BlockchainName>(
        tokenAmountBaseStruct: TokenAmountBaseStruct<T>
    ): Promise<TokenAmount<T>> {
        const token = await super.createToken(tokenAmountBaseStruct);
        return new TokenAmount({
            ...tokenAmountBaseStruct,
            ...token
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
    public get asStruct(): TokenAmountStruct<T> {
        return {
            ...this,
            weiAmount: this.weiAmount
        };
    }

    constructor(tokenStruct: TokenAmountStruct<T>) {
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

    public clone(tokenStruct?: Partial<TokenAmountStruct>): TokenAmount {
        return new TokenAmount({ ...this.asStruct, ...tokenStruct });
    }
}
