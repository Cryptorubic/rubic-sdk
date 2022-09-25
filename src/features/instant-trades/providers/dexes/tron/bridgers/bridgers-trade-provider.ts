import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { TronInstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/tron-instant-trade-provider/tron-instant-trade-provider';
import { BridgersTrade } from 'src/features/instant-trades/providers/dexes/tron/bridgers/bridgers-trade';
import { BridgersQuoteRequest } from 'src/features/common/providers/bridgers/models/bridgers-quote-request';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { BridgersQuoteResponse } from 'src/features/common/providers/bridgers/models/bridgers-quote-response';
import { createTokenNativeAddressProxy } from 'src/features/instant-trades/providers/dexes/abstract/utils/token-native-address-proxy';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { InstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/instant-trade-provider';
import { CrossChainMaxAmountError, CrossChainMinAmountError } from 'src/common/errors';
import BigNumber from 'bignumber.js';
import { BridgersCalculationOptions } from 'src/features/instant-trades/providers/dexes/tron/bridgers/models/bridgers-calculation-options';
import { combineOptions } from 'src/common/utils/options';

export abstract class BridgersTradeProvider extends TronInstantTradeProvider {
    private readonly defaultOptions: BridgersCalculationOptions = {
        slippageTolerance: 0.02
    };

    public get type(): TradeType {
        return TRADE_TYPE.BRIDGERS;
    }

    public async calculate(
        from: PriceTokenAmount<TronBlockchainName>,
        toToken: PriceToken<TronBlockchainName>,
        options?: CalculationOptions
    ): Promise<BridgersTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromTokenAddress = createTokenNativeAddressProxy(from, bridgersNativeAddress).address;
        const toTokenAddress = createTokenNativeAddressProxy(
            toToken,
            bridgersNativeAddress
        ).address;
        const quoteRequest: BridgersQuoteRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromTokenAmount: from.stringWeiAmount,
            fromTokenChain: toBridgersBlockchain[from.blockchain],
            toTokenChain: toBridgersBlockchain[toToken.blockchain]
        };
        const quoteResponse = await this.httpClient.post<BridgersQuoteResponse>(
            'https://sswap.swft.pro/api/sswap/quote',
            quoteRequest
        );
        if (quoteResponse.resCode !== 100) {
            throw InstantTradeProvider.parseError(quoteResponse.resMsg);
        }

        const transactionData = quoteResponse.data.txData;

        if (from.tokenAmount.lt(transactionData.depositMin)) {
            throw new CrossChainMinAmountError(
                new BigNumber(transactionData.depositMin),
                from.symbol
            ); // @todo update error
        }
        if (from.tokenAmount.gt(transactionData.depositMax)) {
            throw new CrossChainMaxAmountError(
                new BigNumber(transactionData.depositMax),
                from.symbol
            );
        }

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(transactionData.toTokenAmount)
        });

        return new BridgersTrade({
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            contractAddress: transactionData.contractAddress
        });
    }
}
