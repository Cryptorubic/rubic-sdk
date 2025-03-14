import BigNumber from 'bignumber.js';
import { BridgersPairIsUnavailableError, MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { combineOptions } from 'src/common/utils/options';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import {
    BridgersQuoteRequest,
    BridgersQuoteResponse
} from 'src/features/common/providers/bridgers/models/bridgers-quote-api';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainPlatformFee } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';
import { tronProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/tron-on-chain-provider/constants/tron-provider-default-options';
import { TronOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/tron-on-chain-provider/tron-on-chain-provider';
import { BridgersTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/tron/bridgers/bridgers-trade';

export class BridgersProvider extends TronOnChainProvider {
    private readonly defaultOptions: RequiredOnChainCalculationOptions = tronProviderDefaultOptions;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BRIDGERS;
    }

    public async calculate(
        from: PriceTokenAmount<TronBlockchainName>,
        toToken: PriceToken<TronBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<BridgersTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromTokenAddress = createTokenNativeAddressProxy(
            from,
            bridgersNativeAddress,
            false
        ).address;
        const toTokenAddress = createTokenNativeAddressProxy(
            toToken,
            bridgersNativeAddress,
            false
        ).address;
        const quoteRequest: BridgersQuoteRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromTokenAmount: from.stringWeiAmount,
            fromTokenChain: toBridgersBlockchain[from.blockchain],
            toTokenChain: toBridgersBlockchain[toToken.blockchain],
            sourceFlag: 'rubic'
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

        const cryptoFeeToken = new TokenAmount({
            ...nativeTokensList[from.blockchain],
            tokenAmount: new BigNumber(transactionData.chainFee)
        });
        const platformFeePercent = transactionData.fee * 100;
        const platformFee: OnChainPlatformFee = {
            percent: platformFeePercent,
            token: await PriceTokenAmount.createToken({
                ...from,
                tokenAmount: from.tokenAmount.multipliedBy(platformFeePercent / 100)
            })
        };

        return new BridgersTrade(
            {
                from,
                to,
                slippageTolerance: fullOptions.slippageTolerance,
                contractAddress: transactionData.contractAddress,
                cryptoFeeToken,
                platformFee
            },
            fullOptions.providerAddress
        );
    }
}
