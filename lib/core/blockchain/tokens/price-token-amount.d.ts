import { TokenBaseStruct } from '../models/token-base-struct';
import { PriceToken } from './price-token';
import BigNumber from 'bignumber.js';
import { TokenStruct } from './token';
export declare type PriceTokenAmountStruct = ConstructorParameters<typeof PriceToken>[number] & ({
    weiAmount: BigNumber;
} | {
    tokenAmount: BigNumber;
});
export declare type PriceTokenAmountBaseStruct = TokenBaseStruct & ({
    weiAmount: BigNumber;
} | {
    tokenAmount: BigNumber;
});
export declare class PriceTokenAmount extends PriceToken {
    static createToken(tokenAmountBaseStruct: PriceTokenAmountBaseStruct): Promise<PriceTokenAmount>;
    static createFromToken(tokenAmount: TokenStruct & ({
        weiAmount: BigNumber;
    } | {
        tokenAmount: BigNumber;
    })): Promise<PriceTokenAmount>;
    private readonly _weiAmount;
    get weiAmount(): BigNumber;
    get stringWeiAmount(): string;
    get tokenAmount(): BigNumber;
    constructor(tokenStruct: PriceTokenAmountStruct);
    weiAmountMinusSlippage(slippage: number): BigNumber;
    weiAmountPlusSlippage(slippage: number): BigNumber;
    cloneAndCreate(tokenStruct?: Partial<PriceTokenAmountStruct>): Promise<PriceTokenAmount>;
    clone(tokenStruct?: Partial<PriceTokenAmountStruct>): PriceTokenAmount;
    calculatePriceImpactPercent(toToken: PriceTokenAmount): number | null;
}
