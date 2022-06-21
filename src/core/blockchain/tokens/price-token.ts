import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
import { Token, TokenStruct } from '@core/blockchain/tokens/token';
import { Injector } from '@core/sdk/injector';
import BigNumber from 'bignumber.js';

export type PriceTokenStruct = ConstructorParameters<typeof Token>[number] & { price: BigNumber };

/**
 * Contains token structure with price in usd per 1 unit.
 */
export class PriceToken extends Token {
    /**
     * Creates PriceToken based on token's address and blockchain.
     * @param tokenBaseStruct Base token structure.
     */
    public static async createToken(tokenBaseStruct: TokenBaseStruct): Promise<PriceToken> {
        const { coingeckoApi } = Injector;

        const tokenPromise = super.createToken(tokenBaseStruct);
        const pricePromise = coingeckoApi.getTokenPrice(tokenBaseStruct);
        const results = await Promise.all([tokenPromise, pricePromise]);

        return new PriceToken({ ...results[0], price: results[1] });
    }

    /**
     * Creates PriceToken, fetching token's price.
     * @param token Token structure.
     */
    public static async createFromToken(token: TokenStruct): Promise<PriceToken> {
        const { coingeckoApi } = Injector;

        const price = await coingeckoApi.getTokenPrice(token);

        return new PriceToken({ ...token, price });
    }

    private _price: BigNumber;

    public get price(): BigNumber {
        return this._price;
    }

    /**
     * Serializes priceToken and its price to struct object.
     */
    public get asStruct(): PriceTokenStruct {
        return {
            ...this,
            price: this.price
        };
    }

    constructor(tokenStruct: PriceTokenStruct) {
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
        this._price = await coingeckoApi.getTokenPrice({ ...this });
    }

    /**
     * Clones token with fetching new price.
     */
    public async cloneAndCreate(tokenStruct?: Partial<PriceTokenStruct>): Promise<PriceToken> {
        const { coingeckoApi } = Injector;

        const price = await coingeckoApi.getTokenPrice(this);

        return new PriceToken({ ...this.asStruct, price, ...tokenStruct });
    }

    public clone(tokenStruct?: Partial<PriceTokenStruct>): PriceToken {
        return new PriceToken({ ...this, ...tokenStruct });
    }
}
