import { TokenStruct } from '@core/blockchain/tokens/token';

export type SymbolTokenStruct = {
    address: string;
    symbol: string;
};

export class SymbolToken {
    public static createFromToken(token: TokenStruct): SymbolToken {
        return {
            address: token.address,
            symbol: token.symbol
        };
    }

    public readonly address: string;

    public readonly symbol: string;

    constructor(symbolTokenStruct: SymbolTokenStruct) {
        this.address = symbolTokenStruct.address;
        this.symbol = symbolTokenStruct.symbol;
    }
}
