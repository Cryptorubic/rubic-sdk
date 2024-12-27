import {
    EvmBlockchainName,
    QuoteRequestInterface,
    QuoteResponseInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { LifiCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/lifi-cross-chain-factory';
import { RangoCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/rango-cross-chain-factory';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { CommonEvmApiCrossChainTrade } from 'src/features/ws-api/models/common-evm-api-cross-chain-trade';
import { CommonEvmApiOnChainTrade } from 'src/features/ws-api/models/common-evm-api-on-chain-trade';

export class TransformUtils {
    private static readonly createFn: Record<
        CrossChainTradeType,
        | ((
              response: QuoteResponseInterface,
              quote: QuoteRequestInterface,
              integratorAddress: string
          ) => Promise<CrossChainTrade>)
        | undefined
    > = {
        across: undefined,
        arbitrum: undefined,
        archon_bridge: undefined,
        bridgers: undefined,
        celer_bridge: undefined,
        changenow: undefined,
        dln: undefined,
        eddy_bridge: undefined,
        layerzero: undefined,
        lifi: LifiCrossChainFactory.getTradeFromApi,
        meson: undefined,
        orbiter_bridge: undefined,
        owl_to_bridge: undefined,
        pulsechain_bridge: undefined,
        rango: RangoCrossChainFactory.getTradeFromApi,
        retro_bridge: undefined,
        router: undefined,
        scroll_bridge: undefined,
        simple_swap: undefined,
        squidrouter: undefined,
        stargate: undefined,
        stargate_v2: undefined,
        symbiosis: undefined,
        taiko_bridge: undefined,
        unizen: undefined,
        xy: undefined
    };

    public static async transformCrossChain(
        response: QuoteResponseInterface,
        quote: QuoteRequestInterface,
        _integratorAddress: string
    ): Promise<WrappedCrossChainTrade> {
        const tradeType = response.providerType as WrappedCrossChainTrade['tradeType'];
        const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);
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

        let trade: CrossChainTrade | null = null;

        if (chainType === CHAIN_TYPE.EVM && response.swapType === 'cross-chain') {
            trade = new CommonEvmApiCrossChainTrade({
                from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                to: toToken,
                apiQuote: quote,
                apiResponse: response,
                feeInfo: {}
            });
        }

        return {
            trade,
            tradeType
        };
    }

    public static async transformOnChain(
        response: QuoteResponseInterface,
        quote: QuoteRequestInterface,
        _integratorAddress: string
    ): Promise<WrappedOnChainTradeOrNull> {
        const tradeType = response.providerType as OnChainTradeType;
        const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);
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

        let trade: OnChainTrade | null = null;

        if (chainType === CHAIN_TYPE.EVM && response.swapType === 'on-chain') {
            trade = new CommonEvmApiOnChainTrade({
                from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                to: toToken as PriceTokenAmount<EvmBlockchainName>,
                apiQuote: quote,
                apiResponse: response,
                feeInfo: {},
                tradeStruct: {
                    from: fromToken as PriceTokenAmount<EvmBlockchainName>,
                    to: toToken as PriceTokenAmount<EvmBlockchainName>,
                    slippageTolerance: 0,
                    path: [],
                    gasFeeInfo: null,
                    useProxy: false,
                    proxyFeeInfo: undefined,
                    fromWithoutFee: fromToken as PriceTokenAmount<EvmBlockchainName>,
                    withDeflation: {
                        from: { isDeflation: false },
                        to: { isDeflation: false }
                    }
                }
            });
        }

        return {
            trade,
            tradeType
        };
    }
}
