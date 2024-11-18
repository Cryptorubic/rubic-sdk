import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { UniZenOnChainQuoteResponse } from 'src/features/common/providers/unizen/models/on-chain-models/unizen-on-chain-quote-response';
import { UniZenOnChainQuoteParams } from 'src/features/common/providers/unizen/models/unizen-quote-params';
import { UniZenApiService } from 'src/features/common/providers/unizen/services/unizen-api-service';

export class UniZenOnChainUtilsService {
    public static async getBestQuote(
        quoteSendParams: UniZenOnChainQuoteParams,
        chainId: number
    ): Promise<UniZenOnChainQuoteResponse> {
        const quotes = await UniZenApiService.getQuoteInfo<UniZenOnChainQuoteResponse[]>(
            quoteSendParams,
            chainId,
            'single'
        );

        const bestQuote = quotes.sort((prev, next) => {
            const nextQuoteTokenAmount = new BigNumber(next.toTokenAmount);
            return nextQuoteTokenAmount.comparedTo(prev.toTokenAmount);
        })[0];

        if (!bestQuote) {
            throw new NotSupportedTokensError();
        }

        return bestQuote;
    }
}
