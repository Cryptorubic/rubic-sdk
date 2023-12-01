import { GetTradeStructType, RangoOnChainTradeStruct } from '../models/rango-on-chain-parser-types';

export class RangoOnChainParser {
    public static getTradeStruct({
        from,
        to,
        fromWithoutFee,
        proxyFeeInfo,
        gasFeeInfo,
        toTokenWeiAmountMin,
        path,
        options
    }: GetTradeStructType): RangoOnChainTradeStruct {
        const slippageTolerance = options.slippageTolerance * 100;
        const useProxy = options.useProxy;
        const withDeflation = options.withDeflation;

        return {
            from,
            to,
            fromWithoutFee,
            gasFeeInfo,
            path,
            proxyFeeInfo,
            slippageTolerance,
            toTokenWeiAmountMin,
            useProxy,
            withDeflation
        };
    }
}
