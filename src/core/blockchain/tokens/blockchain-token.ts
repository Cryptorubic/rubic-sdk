import { RubicError } from '@common/errors/rubic-error';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { TokenLikeStruct } from '@core/blockchain/models/token-like-struct';
import { Injector } from '@core/sdk/injector';
import BigNumber from 'bignumber.js';

type BlockchainTokenStruct = {
    blockchain: BLOCKCHAIN_NAME;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
};

export class BlockchainToken {
    public static async createToken(tokenLikeStruct: TokenLikeStruct) {
        const web3Public = Injector.web3PublicService.getWeb3Public(tokenLikeStruct.blockchain);
        const tokenInfo = await web3Public.callForTokenInfo(tokenLikeStruct.address);

        if (tokenInfo.decimals == null || tokenInfo.name == null || tokenInfo.symbol == null) {
            throw new RubicError('Error while loading token');
        }

        return new BlockchainToken({
            ...tokenLikeStruct,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            decimals: new BigNumber(tokenInfo.decimals).toNumber()
        });
    }

    public readonly blockchain: BLOCKCHAIN_NAME;

    public readonly address: string;

    public readonly name: string;

    public readonly symbol: string;

    public readonly decimals: number;

    constructor(tokenStruct: BlockchainTokenStruct) {
        this.blockchain = tokenStruct.blockchain;
        this.address = tokenStruct.address;
        this.name = tokenStruct.name;
        this.symbol = tokenStruct.symbol;
        this.decimals = tokenStruct.decimals;
    }

    public isEqualTo(token: TokenLikeStruct): boolean {
        return (
            token.blockchain === this.blockchain &&
            token.address.toLowerCase() === this.address.toLowerCase()
        );
    }
}
