import { Cache } from 'src/common/utils/decorators';
import { Injector } from 'src/core/injector/injector';
import { ZeroXSupportedBlockchains } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/constants/zrx-supported-blockchains';
import { ZrxQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/models/zrx-quote-request';
import { ZrxQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/models/zrx-types';
import { getZrxApiBaseUrl } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/utils';

export class ZrxApiService {
    public static getTradeData(
        params: ZrxQuoteRequest,
        blockchain: ZeroXSupportedBlockchains
    ): Promise<ZrxQuoteResponse> {
        const endpoint = this.getApiBaseUrl(blockchain);
        return Injector.httpClient.get<ZrxQuoteResponse>(`${endpoint}swap/v1/quote`, params);
    }

    @Cache
    private static getApiBaseUrl(blockchain: ZeroXSupportedBlockchains): string {
        return getZrxApiBaseUrl(blockchain);
    }
}
