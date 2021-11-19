import { TokenLikeStruct } from '@core/blockchain/models/token-like-struct';
import { BlockchainToken } from '@core/blockchain/tokens/blockchain-token';
import { Injector } from '@core/sdk/injector';
import BigNumber from 'bignumber.js';

type TokenStruct = ConstructorParameters<typeof BlockchainToken>[number] & { price: BigNumber };

export class Token extends BlockchainToken {
    public static async createToken(tokenLikeStruct: TokenLikeStruct): Promise<Token> {
        const { coingeckoApi } = Injector;

        const blockchainTokenPromise = super.createToken(tokenLikeStruct);
        const pricePromise = coingeckoApi.getTokenPrice(tokenLikeStruct);
        const results = await Promise.all([blockchainTokenPromise, pricePromise]);

        return new Token({ ...results[0], price: results[1] });
    }

    private _price: BigNumber;

    public get price(): BigNumber {
        return this._price;
    }

    public get asStruct(): TokenStruct {
        return {
            ...this,
            price: this.price
        };
    }

    constructor(tokenStruct: TokenStruct) {
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
