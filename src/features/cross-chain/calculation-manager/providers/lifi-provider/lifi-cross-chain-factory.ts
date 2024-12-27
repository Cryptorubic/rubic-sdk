import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BitcoinBlockchainName,
    BlockchainName,
    SolanaBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { BitcoinEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/bitcoin-web3-private/models/bitcoin-encoded-config';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { LifiBitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/chains/lifi-bitcoin-cross-chain-trade';

import { CrossChainTrade } from '../common/cross-chain-trade';
import { RubicStep } from '../common/models/rubicStep';
import { LifiEvmCrossChainTrade } from './chains/lifi-evm-cross-chain-trade';
import { LifiSolanaCrossChainTrade } from './chains/lifi-solana-cross-chain-trade';
import {
    LifiCrossChainTradeConstructor,
    LifiEvmCrossChainTradeConstructor
} from './models/lifi-cross-chain-trade-constructor';

export class LifiCrossChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: LifiCrossChainTradeConstructor<BlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ): CrossChainTrade<EvmEncodeConfig | { data: string } | BitcoinEncodedConfig> {
        if (BlockchainsInfo.isSolanaBlockchainName(fromBlockchain)) {
            return new LifiSolanaCrossChainTrade(
                constructorParams as LifiCrossChainTradeConstructor<SolanaBlockchainName>,
                providerAddress,
                routePath,
                useProxy,
                apiQuote,
                apiResponse
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new LifiEvmCrossChainTrade(
                constructorParams as LifiEvmCrossChainTradeConstructor,
                providerAddress,
                routePath,
                useProxy,
                apiQuote,
                apiResponse
            );
        }

        if (BlockchainsInfo.isBitcoinBlockchainName(fromBlockchain)) {
            return new LifiBitcoinCrossChainTrade(
                constructorParams as LifiCrossChainTradeConstructor<BitcoinBlockchainName>,
                providerAddress,
                routePath,
                false,
                apiQuote,
                apiResponse
            );
        }

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

        return this.createTrade(
            fromBlockchain,
            {
                from: fromToken,
                to: toToken,
                route: undefined as any,
                toTokenAmountMin,
                feeInfo: {},
                priceImpact: response.estimate.priceImpact,
                onChainSubtype: { from: undefined, to: undefined },
                bridgeType: tradeType,
                slippage: response.estimate.slippage
            },
            integratorAddress,
            [],
            false,
            quote,
            response
        );
    }
}
