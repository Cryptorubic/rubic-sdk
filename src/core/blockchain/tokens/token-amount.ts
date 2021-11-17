import { Token } from '@core/blockchain/tokens/token';
import BigNumber from 'bignumber.js';

type TokenAmountStruct = ConstructorParameters<typeof Token>[number] & { weiAmount: BigNumber };

export class TokenAmount extends Token {
    private readonly _weiAmount: BigNumber;

    get weiAmount(): BigNumber {
        return new BigNumber(this._weiAmount);
    }

    get stringWeiAmount(): string {
        return this._weiAmount.toFixed(0);
    }

    get tokenAmount(): BigNumber {
        return new BigNumber(this._weiAmount).div(new BigNumber(10).pow(this.decimals));
    }

    constructor(tokenStruct: TokenAmountStruct) {
        super(tokenStruct);
        this._weiAmount = new BigNumber(tokenStruct.weiAmount);
    }
}
