import { TokenAmount } from 'src/common/tokens';

export interface OnChainPlatformFee {
    percent: number;
    token: TokenAmount;
}

export interface OnChainProxyFeeInfo {
    /**
     * Fee in native token, attached as additional value.
     */
    fixedFeeToken: TokenAmount;

    /**
     * Fee in percents of source token.
     */
    platformFee: OnChainPlatformFee;
}
