import { RubicError } from '@common/errors/rubic-error';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
import { Injector } from '@core/sdk/injector';

type TokenStruct = {
    blockchain: BLOCKCHAIN_NAME;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
};

export class Token {
    public static async createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token> {
        const web3Public = Injector.web3PublicService.getWeb3Public(tokenBaseStruct.blockchain);
        const tokenInfo = await web3Public.callForTokenInfo(tokenBaseStruct.address);

        if (tokenInfo.decimals == null || tokenInfo.name == null || tokenInfo.symbol == null) {
            throw new RubicError('Error while loading token');
        }

        return new Token({
            ...tokenBaseStruct,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            decimals: parseInt(tokenInfo.decimals)
        });
    }

    public readonly blockchain: BLOCKCHAIN_NAME;

    public readonly address: string;

    public readonly name: string;

    public readonly symbol: string;

    public readonly decimals: number;

    constructor(tokenStruct: TokenStruct) {
        this.blockchain = tokenStruct.blockchain;
        this.address = tokenStruct.address;
        this.name = tokenStruct.name;
        this.symbol = tokenStruct.symbol;
        this.decimals = tokenStruct.decimals;
    }

    public isEqualTo(token: TokenBaseStruct): boolean {
        return (
            token.blockchain === this.blockchain &&
            token.address.toLowerCase() === this.address.toLowerCase()
        );
    }
}
