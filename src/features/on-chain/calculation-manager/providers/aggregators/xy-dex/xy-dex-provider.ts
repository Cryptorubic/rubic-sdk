import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';
import {
    XY_AFFILIATE_ADDRESS,
    XY_API_ENDPOINT,
    XY_NATIVE_ADDRESS
} from 'src/features/common/providers/xy/constants/xy-api-params';
import { XyQuoteRequest } from 'src/features/common/providers/xy/models/xy-quote-request';
import { XyQuoteResponse } from 'src/features/common/providers/xy/models/xy-quote-response';
import { xyAnalyzeStatusCode } from 'src/features/common/providers/xy/utils/xy-utils';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { xySupportedBlockchains } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-supported-blockchains';
import { LifiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/lifi/models/lifi-trade-struct';
import { XyDexTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/xy-dex/models/xy-dex-trade-struct';
import { XyDexTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/xy-dex/xy-dex-trade';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { LifiEvmOnChainTrade } from '../lifi/chains/lifi-evm-on-chain-trade';

export class XyDexProvider extends AggregatorOnChainProvider {
    private readonly defaultOptions = evmProviderDefaultOptions;

    public readonly tradeType = ON_CHAIN_TRADE_TYPE.XY_DEX;

    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return xySupportedBlockchains.some(item => item === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<XyDexTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError('Blockchain is not supported');
        }
        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.getWalletAddress(from.blockchain);
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress
        });

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const { toTokenAmountInWei, contractAddress, provider } = await this.getTradeInfo(
            from,
            toToken,
            fullOptions
        );

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: toTokenAmountInWei
        });

        const tradeStruct: XyDexTradeStruct = {
            contractAddress,
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            path: [from, to],
            provider
        };

        return new XyDexTrade(tradeStruct, fullOptions.providerAddress);
    }

    private async getTradeInfo(
        from: PriceTokenAmount,
        toToken: Token,
        options: RequiredOnChainCalculationOptions
    ): Promise<{
        toTokenAmountInWei: BigNumber;
        estimatedGas: string;
        contractAddress: string;
        provider: string;
    }> {
        const chainId = blockchainId[from.blockchain];
        const srcQuoteTokenAddress = from.isNative ? XY_NATIVE_ADDRESS : from.address;
        const dstQuoteTokenAddress = toToken.isNative ? XY_NATIVE_ADDRESS : toToken.address;

        const quoteTradeParams: XyQuoteRequest = {
            srcChainId: chainId,
            srcQuoteTokenAddress,
            srcQuoteTokenAmount: from.stringWeiAmount,
            dstChainId: chainId,
            dstQuoteTokenAddress,
            slippage: options.slippageTolerance * 100,
            affiliate: XY_AFFILIATE_ADDRESS
        };

        const trade = await Injector.httpClient.get<XyQuoteResponse>(`${XY_API_ENDPOINT}/quote`, {
            params: { ...quoteTradeParams }
        });

        if (!trade.success) {
            xyAnalyzeStatusCode(trade.errorCode, trade.errorMsg);
        }

        const bestRoute = trade.routes[0]!;

        return {
            toTokenAmountInWei: new BigNumber(bestRoute.dstQuoteTokenAmount),
            estimatedGas: bestRoute.estimatedGas,
            contractAddress: bestRoute.contractAddress,
            provider: bestRoute.srcSwapDescription.provider
        };
    }

    protected async getGasFeeInfo(
        lifiTradeStruct: LifiTradeStruct<EvmBlockchainName>
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(lifiTradeStruct.from.blockchain);
            const gasLimit = await LifiEvmOnChainTrade.getGasLimit(lifiTradeStruct);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }
}
