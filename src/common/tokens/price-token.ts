import BigNumber from 'bignumber.js';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { Token, TokenStruct } from 'src/common/tokens/token';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';

export type PriceTokenStruct<T extends BlockchainName = BlockchainName> = TokenStruct<T> & {
    price: BigNumber;
};

/**
 * Contains token structure with price in usd per 1 unit.
 */
export class PriceToken<T extends BlockchainName = BlockchainName> extends Token<T> {
    /**
     * Creates PriceToken based on token's address and blockchain.
     * @param tokenBaseStruct Base token structure.
     */
    public static async createToken<T extends BlockchainName = BlockchainName>(
        tokenBaseStruct: TokenBaseStruct<T>
    ): Promise<PriceToken<T>> {
        const { coingeckoApi } = Injector;

        const tokenPromise = super.createToken(tokenBaseStruct);
        const pricePromise = coingeckoApi
            .getTokenPrice(tokenBaseStruct)
            .catch(_err => new BigNumber(NaN));
        const results = await Promise.all([tokenPromise, pricePromise]);

        return new PriceToken({ ...results[0], price: results[1] });
    }

    /**
     * Creates PriceToken, fetching token's price.
     * @param token Token structure.
     */
    public static async createFromToken<T extends BlockchainName = BlockchainName>(
        token: TokenStruct<T>
    ): Promise<PriceToken<T>> {
        const { coingeckoApi } = Injector;

        const price = await coingeckoApi.getTokenPrice(token).catch(_err => new BigNumber(NaN));

        return new PriceToken({ ...token, price });
    }

    private _price: BigNumber;

    public get price(): BigNumber {
        return this._price;
    }

    /**
     * Serializes priceToken and its price to struct object.
     */
    public get asStruct(): PriceTokenStruct<T> {
        return {
            ...this,
            price: this.price
        };
    }

    constructor(tokenStruct: PriceTokenStruct<T>) {
        super(tokenStruct);
        this._price = tokenStruct.price;
    }

    /**
     * Fetches current token price and saves it into token.
     */
    public async getAndUpdateTokenPrice(): Promise<BigNumber> {
        await this.updateTokenPrice();
        return this.price;
    }

    private async updateTokenPrice(): Promise<void> {
        const { coingeckoApi } = Injector;
        this._price = await coingeckoApi.getTokenPrice({ ...this }).catch(_err => this._price);
    }

    /**
     * Clones token with fetching new price.
     */
    public async cloneAndCreate(tokenStruct?: Partial<PriceTokenStruct>): Promise<PriceToken> {
        const { coingeckoApi } = Injector;

        const price = await coingeckoApi.getTokenPrice(this).catch(_err => this._price);

        return new PriceToken({ ...this.asStruct, price, ...tokenStruct });
    }

    public clone(tokenStruct?: Partial<PriceTokenStruct>): PriceToken {
        return new PriceToken({ ...this, ...tokenStruct });
    }
}
