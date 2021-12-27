import { TokenBaseStruct } from '../models/token-base-struct';
import { Token, TokenStruct } from './token';
import BigNumber from 'bignumber.js';
export declare type PriceTokenStruct = ConstructorParameters<typeof Token>[number] & {
    price: BigNumber;
};
export declare class PriceToken extends Token {
    static createToken(tokenBaseStruct: TokenBaseStruct): Promise<PriceToken>;
    static createFromToken(token: TokenStruct): Promise<PriceToken>;
    private _price;
    get price(): BigNumber;
    get asStruct(): PriceTokenStruct;
    constructor(tokenStruct: PriceTokenStruct);
    getAndUpdateTokenPrice(): Promise<BigNumber>;
    private updateTokenPrice;
    cloneAndCreate(tokenStruct?: Partial<PriceTokenStruct>): Promise<PriceToken>;
    clone(tokenStruct?: Partial<PriceTokenStruct>): PriceToken;
}
