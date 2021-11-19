import { TokenLikeStruct } from '@core/blockchain/models/token-like-struct';
import { BlockchainToken } from '@core/blockchain/tokens/blockchain-token';
import BigNumber from 'bignumber.js';

type TokenStruct = ConstructorParameters<typeof BlockchainToken>[number] & { price: BigNumber };

export class Token extends BlockchainToken {
    public static async createToken(tokenLikeStruct: TokenLikeStruct): Promise<Token> {
        const blockchainTokenPromise = super.createToken(tokenLikeStruct);
        const pricePromise = Promise.resolve(new BigNumber(1)); // TODO: call coingecko
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
        // TODO: реализовать метод
        this._price = new BigNumber(0);
    }
}
