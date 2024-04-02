import { Injector } from 'src/core/injector/injector';
import {
    PiteasQuoteRequestParams,
    PiteasSuccessQuoteResponse
} from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/models/piteas-quote';

export class PiteasApiService {
    public static apiEndpoint = 'https://api.piteas.io';

    public static fetchQuote(
        quoteRequestParams: PiteasQuoteRequestParams
    ): Promise<PiteasSuccessQuoteResponse> {
        return Injector.httpClient.get<PiteasSuccessQuoteResponse>(
            `${PiteasApiService.apiEndpoint}/quote`,
            {
                params: { ...quoteRequestParams }
            }
        );
    }
}
