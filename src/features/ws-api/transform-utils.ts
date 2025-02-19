import {
    BitcoinBlockchainName,
    EvmBlockchainName,
    QuoteRequestInterface,
    QuoteResponseInterface,
    SolanaBlockchainName,
    TonBlockchainName,
    TronBlockchainName
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ArbitrumRbcBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/arbitrum-rbc-bridge-trade';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { EddyBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/eddy-bridge-trade';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { EvmApiCrossChainTrade } from 'src/features/ws-api/chains/evm/evm-api-cross-chain-trade';
import { EvmApiOnChainTrade } from 'src/features/ws-api/chains/evm/evm-api-on-chain-trade';
import { SolanaApiCrossChainTrade } from 'src/features/ws-api/chains/solana/solana-api-cross-chain-trade';
import { SolanaApiOnChainTrade } from 'src/features/ws-api/chains/solana/solana-api-on-chain-trade';
import { TonApiCrossChainTrade } from 'src/features/ws-api/chains/ton/ton-api-cross-chain-trade';
import { TonApiOnChainTrade } from 'src/features/ws-api/chains/ton/ton-api-on-chain-trade';
import { TronApiCrossChainTrade } from 'src/features/ws-api/chains/tron/tron-api-cross-chain-trade';
import { TronApiOnChainTrade } from 'src/features/ws-api/chains/tron/tron-api-on-chain-trade';

import {
    TransferTradeSupportedProviders,
    transferTradeSupportedProviders
} from '../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import { BitcoinApiCrossChainTrade } from './chains/bitcoin/bitcoin-api-cross-chain-trade';
import { ApiCrossChainTransferTrade } from './chains/transfer-trade/api-cross-chain-transfer-trade';
import { RubicApiError } from './models/rubic-api-error';
import { RubicApiParser } from './utils/rubic-api-parser';
import { RubicApiUtils } from './utils/rubic-api-utils';

export class TransformUtils {
    public static async transformCrossChain(
        res: QuoteResponseInterface,
        quote: QuoteRequestInterface,
        _integratorAddress: string,
        err?: RubicApiError
    ): Promise<WrappedCrossChainTrade> {
        let response = res;

        if (!response && err) {
            response = await RubicApiUtils.getEmptyResponse(quote, err.type);
        }

        const parsedError = err ? RubicApiParser.parseRubicApiErrors(err) : err;

        const tradeType = response.providerType as WrappedCrossChainTrade['tradeType'];
        const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);
        const { fromToken, toToken } = RubicApiUtils.getFromToTokens(
            response.tokens,
            quote.srcTokenAmount,
            response.estimate.destinationTokenAmount
        );

        let trade: CrossChainTrade | null = null;

        const routePath = RubicApiParser.parseRoutingDto(response.routing);

        const feeInfo = RubicApiParser.parseFeeInfoDto(response.fees);

        const parsedWarnings = RubicApiParser.parseRubicApiWarnings(response.warnings);

        const isTransferTrade =
            transferTradeSupportedProviders.includes(
                tradeType as TransferTradeSupportedProviders
            ) && chainType !== CHAIN_TYPE.EVM;

        if (chainType === CHAIN_TYPE.EVM) {
            if (response.providerType === CROSS_CHAIN_TRADE_TYPE.ARBITRUM) {
                trade = new ArbitrumRbcBridgeTrade({
                    from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                    to: toToken,
                    apiQuote: quote,
                    apiResponse: response,
                    feeInfo,
                    routePath,
                    needAuthWallet: false
                });
            } else if (tradeType === CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE) {
                trade = new EddyBridgeTrade({
                    from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                    to: toToken,
                    apiQuote: quote,
                    apiResponse: response,
                    feeInfo,
                    routePath,
                    needAuthWallet: false
                });
            } else {
                trade = new EvmApiCrossChainTrade({
                    from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                    to: toToken,
                    apiQuote: quote,
                    apiResponse: response,
                    feeInfo,
                    routePath,
                    needAuthWallet: parsedWarnings.needAuthWallet
                });
            }
        } else if (isTransferTrade) {
            trade = new ApiCrossChainTransferTrade({
                from: fromToken as PriceTokenAmount<TonBlockchainName>,
                to: toToken,
                apiQuote: quote,
                apiResponse: response,
                feeInfo,
                routePath
            });
        } else if (chainType === CHAIN_TYPE.TON) {
            trade = new TonApiCrossChainTrade({
                from: fromToken as PriceTokenAmount<TonBlockchainName>,
                to: toToken,
                apiQuote: quote,
                apiResponse: response,
                feeInfo,
                routePath
            });
        } else if (chainType === CHAIN_TYPE.TRON) {
            trade = new TronApiCrossChainTrade({
                from: fromToken as PriceTokenAmount<TronBlockchainName>,
                to: toToken as PriceTokenAmount,
                apiQuote: quote,
                apiResponse: response,
                feeInfo,
                routePath
            });
        } else if (chainType === CHAIN_TYPE.BITCOIN) {
            trade = new BitcoinApiCrossChainTrade({
                from: fromToken as PriceTokenAmount<BitcoinBlockchainName>,
                to: toToken,
                apiQuote: quote,
                apiResponse: response,
                feeInfo,
                routePath
            });
        } else if (chainType === CHAIN_TYPE.SOLANA) {
            trade = new SolanaApiCrossChainTrade({
                from: fromToken as PriceTokenAmount<SolanaBlockchainName>,
                to: toToken,
                apiQuote: quote,
                apiResponse: response,
                feeInfo,
                routePath
            });
        }

        return {
            trade,
            tradeType,
            ...(parsedError && { error: parsedError })
        };
    }

    public static async transformOnChain(
        res: QuoteResponseInterface,
        quote: QuoteRequestInterface,
        _integratorAddress: string,
        err?: RubicApiError
    ): Promise<WrappedOnChainTradeOrNull> {
        let response = res;

        if (!response && err) {
            response = await RubicApiUtils.getEmptyResponse(quote, err.type);
        }

        const parsedError = err ? RubicApiParser.parseRubicApiErrors(err) : err;

        const tradeType = response.providerType as OnChainTradeType;
        const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);
        const { fromToken, toToken } = RubicApiUtils.getFromToTokens(
            response.tokens,
            quote.srcTokenAmount,
            response.estimate.destinationTokenAmount
        );

        const routePath = RubicApiParser.parseRoutingDto(response.routing);
        const feeInfo = RubicApiParser.parseFeeInfoDto(response.fees);

        let trade: OnChainTrade | null = null;

        if (chainType === CHAIN_TYPE.EVM) {
            trade = new EvmApiOnChainTrade({
                from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                to: toToken as PriceTokenAmount<EvmBlockchainName>,
                feeInfo,
                tradeStruct: {
                    from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                    to: toToken as PriceTokenAmount<EvmBlockchainName>,
                    slippageTolerance: quote.slippage || 0,
                    path: routePath,
                    gasFeeInfo: null,
                    useProxy: false,
                    proxyFeeInfo: undefined,
                    fromWithoutFee: fromToken as PriceTokenAmount<EvmBlockchainName>,
                    apiQuote: quote,
                    apiResponse: response,
                    withDeflation: {
                        from: { isDeflation: false },
                        to: { isDeflation: false }
                    }
                }
            });
        } else if (chainType === CHAIN_TYPE.TON) {
            trade = new TonApiOnChainTrade({
                from: fromToken as PriceTokenAmount<TonBlockchainName>,
                to: toToken as PriceTokenAmount<TonBlockchainName>,
                apiQuote: quote,
                apiResponse: response,
                feeInfo,
                tradeStruct: {
                    from: fromToken as PriceTokenAmount<TonBlockchainName>,
                    to: toToken as PriceTokenAmount<TonBlockchainName>,
                    slippageTolerance: quote.slippage || 0,
                    gasFeeInfo: null,
                    useProxy: false,
                    routingPath: routePath,
                    // @TODO API
                    isChangedSlippage: false,
                    withDeflation: {
                        from: { isDeflation: false },
                        to: { isDeflation: false }
                    },
                    apiQuote: quote,
                    apiResponse: response
                }
            });
        } else if (chainType === CHAIN_TYPE.TRON) {
            trade = new TronApiOnChainTrade({
                from: fromToken as PriceTokenAmount<TronBlockchainName>,
                to: toToken as PriceTokenAmount<TronBlockchainName>,
                apiQuote: quote,
                apiResponse: response,
                feeInfo
            });
        } else if (chainType === CHAIN_TYPE.BITCOIN) {
            // @TODO API
            console.log('btc swap');
        } else if (chainType === CHAIN_TYPE.SOLANA) {
            trade = new SolanaApiOnChainTrade({
                from: fromToken as PriceTokenAmount<SolanaBlockchainName>,
                to: toToken as PriceTokenAmount<SolanaBlockchainName>,
                apiQuote: quote,
                apiResponse: response,
                feeInfo,
                tradeStruct: {
                    from: fromToken as PriceTokenAmount<SolanaBlockchainName>,
                    fromWithoutFee: fromToken as PriceTokenAmount<SolanaBlockchainName>,
                    to: toToken as PriceTokenAmount<SolanaBlockchainName>,
                    slippageTolerance: quote.slippage || 0,
                    path: routePath,
                    gasFeeInfo: null,
                    useProxy: false,
                    proxyFeeInfo: undefined,
                    withDeflation: {
                        from: { isDeflation: false },
                        to: { isDeflation: false }
                    }
                }
            });
        }

        return {
            trade,
            tradeType,
            ...(parsedError && { error: parsedError })
        };
    }
}
