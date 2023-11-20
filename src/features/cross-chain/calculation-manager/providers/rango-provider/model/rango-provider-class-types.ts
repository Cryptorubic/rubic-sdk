import { Asset } from 'rango-sdk-basic';

export interface TransformedCalculationQueryParams {
    fromAsset: Asset;
    toAsset: Asset;
    amountQueryParam: string;
}
