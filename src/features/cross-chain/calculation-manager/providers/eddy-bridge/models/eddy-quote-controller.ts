import BigNumber from 'bignumber.js';

export interface EddyQuoteController {
    calculateToAmount(): Promise<BigNumber>;
    calculateToStringWeiAmount(): Promise<string>;
}
