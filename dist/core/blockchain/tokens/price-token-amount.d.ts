import { TokenBaseStruct } from '@core/blockchain/models/token-base-struct';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import BigNumber from 'bignumber.js';
import { TokenStruct } from '@core/blockchain/tokens/token';
declare type PriceTokenAmountStruct = ConstructorParameters<typeof PriceToken>[number] & ({
    weiAmount: BigNumber;
} | {
    tokenAmount: BigNumber;
});
declare type TokenAmountBaseStruct = TokenBaseStruct & {
    weiAmount: BigNumber;
};
export declare class PriceTokenAmount extends PriceToken {
    static createToken(tokenAmountBaseStruct: TokenAmountBaseStruct): Promise<PriceTokenAmount>;
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
    calculatePriceImpact(toToken: PriceTokenAmount): number | null;
}
export {};
