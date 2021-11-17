import { BlockchainToken } from '@core/blockchain/tokens/blockchain-token';
import BigNumber from 'bignumber.js';

type TokenStruct = ConstructorParameters<typeof BlockchainToken>[number] & { price: BigNumber };

export class Token extends BlockchainToken {
    public readonly price: BigNumber;

    constructor(tokenStruct: TokenStruct) {
        super(tokenStruct);
        this.price = tokenStruct.price;
    }
}
