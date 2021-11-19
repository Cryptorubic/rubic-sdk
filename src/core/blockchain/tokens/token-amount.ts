import { TokenLikeStruct } from '@core/blockchain/models/token-like-struct';
import { Token } from '@core/blockchain/tokens/token';
import { Injector } from '@core/sdk/injector';
import BigNumber from 'bignumber.js';

type TokenAmountStruct = ConstructorParameters<typeof Token>[number] & { weiAmount: BigNumber };

type CreationTokenStruct =
    | (TokenLikeStruct & { userAddress: string })
    | (TokenLikeStruct & { weiAmount: BigNumber });

export class TokenAmount extends Token {
    public static async createToken(tokenLikeStruct: CreationTokenStruct): Promise<Token> {
        const tokenPromise = super.createToken(tokenLikeStruct);
        if ('weiAmount' in tokenLikeStruct) {
            const token = await tokenPromise;
            return new TokenAmount({ ...token.asStruct, weiAmount: tokenLikeStruct.weiAmount });
        }

        const web3Public = Injector.web3PublicService.getWeb3Public(tokenLikeStruct.blockchain);

        const balancePromise = await web3Public.getBalance(
            tokenLikeStruct.userAddress,
            tokenLikeStruct.address
        );

        const result = await Promise.all([tokenPromise, balancePromise]);
        return new TokenAmount({ ...result[0].asStruct, weiAmount: result[1] });
    }

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
