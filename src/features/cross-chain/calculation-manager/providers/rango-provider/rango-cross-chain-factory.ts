import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { RangoCrossChainTradeConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/model/rango-cross-chain-parser-types';

import { CrossChainTrade } from '../common/cross-chain-trade';

export class RangoCrossChainFactory {
    public static createTrade(
        _fromBlockchain: BlockchainName,
        _constructorParams: RangoCrossChainTradeConstructorParams<BlockchainName>
    ): CrossChainTrade<EvmEncodeConfig | BitcoinEncodedConfig> {
        // if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
        //     return new RangoEvmCrossChainTrade(
        //         constructorParams as RangoCrossChainTradeConstructorParams<EvmBlockchainName>
        //     );
        // }

        // if (BlockchainsInfo.isBitcoinBlockchainName(fromBlockchain)) {
        //     return new RangoBitcoinCrossChainTrade(
        //         constructorParams as RangoCrossChainTradeConstructorParams<BitcoinBlockchainName>
        //     );
        // }

        throw new Error('Can not create trade instance');
    }

    public static async getTradeFromApi(
        response: QuoteResponseInterface,
        quote: QuoteRequestInterface,
        integratorAddress: string
    ): Promise<CrossChainTrade> {
        const tradeType = response.providerType as WrappedCrossChainTrade['tradeType'];
        const fromBlockchain = quote.srcTokenBlockchain;
        const fromToken = new PriceTokenAmount({
            ...response.tokens.from,
            price: new BigNumber(response.tokens.from.price || NaN),
            tokenAmount: new BigNumber(quote.srcTokenAmount)
        });
        const toToken = new PriceTokenAmount({
            ...response.tokens.to,
            price: new BigNumber(response.tokens.to.price || NaN),
            tokenAmount: new BigNumber(response.estimate.destinationTokenAmount)
        });
        const toTokenAmountMin = new BigNumber(response.estimate.destinationTokenMinAmount);

        return RangoCrossChainFactory.createTrade(fromBlockchain, {
            crossChainTrade: {
                from: fromToken,
                to: toToken,
                toTokenAmountMin,
                swapQueryParams: undefined as any,
                feeInfo: {},
                priceImpact: response.estimate.priceImpact,
                // onChainSubtype: { from: undefined, to: undefined },
                // bridgeType: tradeType,
                slippage: response.estimate.slippage,
                gasData: null,
                bridgeSubtype: tradeType
            },
            providerAddress: integratorAddress,
            routePath: [],
            useProxy: false,
            apiQuote: quote,
            apiResponse: response
        });
    }
}
