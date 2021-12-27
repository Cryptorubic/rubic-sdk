import { BLOCKCHAIN_NAME } from '../models/BLOCKCHAIN_NAME';
import { TokenBaseStruct } from '../models/token-base-struct';
export declare type TokenStruct = {
    blockchain: BLOCKCHAIN_NAME;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
};
export declare class Token {
    static createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token>;
    static createTokens(tokensAddresses: string[] | ReadonlyArray<string>, blockchain: BLOCKCHAIN_NAME): Promise<Token[]>;
    static tokensToAddresses(tokens: Token[]): string[];
    readonly blockchain: BLOCKCHAIN_NAME;
    readonly address: string;
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
    get isNative(): boolean;
    constructor(tokenStruct: TokenStruct);
    isEqualTo(token: TokenBaseStruct): boolean;
    clone(tokenStruct?: Partial<TokenStruct>): Token;
}
