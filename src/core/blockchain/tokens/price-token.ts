import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
import { Token, TokenStruct } from '@core/blockchain/tokens/token';
import { Injector } from '@core/sdk/injector';
import BigNumber from 'bignumber.js';

type PriceTokenStruct = ConstructorParameters<typeof Token>[number] & { price: BigNumber };

export class PriceToken extends Token {
    public static async createToken(tokenBaseStruct: TokenBaseStruct): Promise<PriceToken> {
        const { coingeckoApi } = Injector;

        const tokenPromise = super.createToken(tokenBaseStruct);
        const pricePromise = coingeckoApi.getTokenPrice(tokenBaseStruct);
        const results = await Promise.all([tokenPromise, pricePromise]);

        return new PriceToken({ ...results[0], price: results[1] });
    }

    public static async createFromToken(token: TokenStruct): Promise<PriceToken> {
        const { coingeckoApi } = Injector;

        const price = await coingeckoApi.getTokenPrice(token);

        return new PriceToken({ ...token, price });
    }

    private _price: BigNumber;

    public get price(): BigNumber {
        return this._price;
    }

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

    public async getAndUpdateTokenPrice(): Promise<BigNumber> {
        await this.updateTokenPrice();
        return this.price;
    }

    private async updateTokenPrice(): Promise<void> {
        const { coingeckoApi } = Injector;
        this._price = await coingeckoApi.getTokenPrice({ ...this });
    }
}
