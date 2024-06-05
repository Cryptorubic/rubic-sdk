import BigNumber from 'bignumber.js';

export interface FetchedMesonTradeInfo {
    mesonFee: string;
    sourceAssetString: string;
    targetAssetString: string;
    min: BigNumber;
    max: BigNumber;
}
