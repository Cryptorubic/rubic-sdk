import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { UniZenCcrQuoteResponse } from 'src/features/common/providers/unizen/models/cross-chain-models/unizen-ccr-quote-response';
import { UniZenCcrQuoteParams } from 'src/features/common/providers/unizen/models/unizen-quote-params';
import { UniZenApiService } from 'src/features/common/providers/unizen/services/unizen-api-service';

export class UniZenCcrUtilsService {
    public static async getBestQuote(
        quoteSendParams: UniZenCcrQuoteParams,
        srcChainId: number
    ): Promise<UniZenCcrQuoteResponse> {
        const quotes = await UniZenApiService.getQuoteInfo<UniZenCcrQuoteResponse[]>(
            quoteSendParams,
            srcChainId,
            'cross'
        );

        const bestQuote = quotes.sort((prev, next) => {
            const prevTokenAmount = new BigNumber(next.transactionData.params.actualQuote);
            return prevTokenAmount.comparedTo(prev.transactionData.params.actualQuote);
        })[0];

        if (!bestQuote) {
            throw new NotSupportedTokensError();
        }

        return bestQuote;
    }
}
