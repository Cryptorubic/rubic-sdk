import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

interface TokenLikeStruct {
    address: string;
    blockchain: BLOCKCHAIN_NAME;
}

type BlockchainTokenStruct = {
    blockchain: BLOCKCHAIN_NAME;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
};

export class BlockchainToken {
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
