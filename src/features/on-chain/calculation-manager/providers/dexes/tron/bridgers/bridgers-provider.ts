import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { TronOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/on-chain-provider/tron-on-chain-provider/tron-on-chain-provider';
import { BridgersTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/tron/bridgers/bridgers-trade';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { createTokenNativeAddressProxy } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/utils/token-native-address-proxy';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/on-chain-provider/on-chain-provider';
import { BridgersPairIsUnavailableError, MaxAmountError, MinAmountError } from 'src/common/errors';
import BigNumber from 'bignumber.js';
import { BridgersCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/tron/bridgers/models/bridgers-calculation-options';
import { combineOptions } from 'src/common/utils/options';
import {
    BridgersQuoteRequest,
    BridgersQuoteResponse
} from 'src/features/common/providers/bridgers/models/bridgers-quote-api';
import { TokenAmountSymbol } from 'src/common/tokens/models/token-amount-symbol';

export class BridgersProvider extends TronOnChainProvider {
    private readonly defaultOptions: BridgersCalculationOptions = {
        slippageTolerance: 0.02
    };

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BRIDGERS;
    }

    public async calculate(
        from: PriceTokenAmount<TronBlockchainName>,
        toToken: PriceToken<TronBlockchainName>,
        options?: OnChainCalculationOptions
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
        const transactionData = quoteResponse.data?.txData;
        if (quoteResponse.resCode !== 100 || !transactionData) {
            throw OnChainProvider.parseError(new BridgersPairIsUnavailableError());
        }

        if (from.tokenAmount.lt(transactionData.depositMin)) {
            throw new MinAmountError(new BigNumber(transactionData.depositMin), from.symbol);
        }
        if (from.tokenAmount.gt(transactionData.depositMax)) {
            throw new MaxAmountError(new BigNumber(transactionData.depositMax), from.symbol);
        }

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(transactionData.toTokenAmount)
        });

        const cryptoFeeToken: TokenAmountSymbol = {
            tokenAmount: new BigNumber(transactionData.chainFee),
            symbol: toToken.symbol
        };
        const platformFeePercent = transactionData.fee * 100;

        return new BridgersTrade({
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            contractAddress: transactionData.contractAddress,
            cryptoFeeToken,
            platformFeePercent
        });
    }
}
