import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import {
    XY_API_ENDPOINT,
    XY_NATIVE_ADDRESS
} from 'src/features/common/providers/xy/constants/xy-api-params';
import { XyQuoteRequest } from 'src/features/common/providers/xy/models/xy-quote-request';
import { XyQuoteResponse } from 'src/features/common/providers/xy/models/xy-quote-response';
import { xyAnalyzeStatusCode } from 'src/features/common/providers/xy/utils/xy-utils';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { XyDexTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-dex-trade-struct';
import { XyDexTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/xy-dex-trade';

export abstract class XyDexAbstractProvider extends EvmOnChainProvider {
    private readonly defaultOptions = evmProviderDefaultOptions;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.XY_DEX;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<XyDexTrade> {
        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.walletAddress;
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress
        });

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const { toTokenAmountInWei, estimatedGas, contractAddress, provider } =
            await this.getTradeInfo(from, toToken, fullOptions);

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

        try {
            const gasPriceInfo = await this.getGasPriceInfo();
            const gasLimit = (await XyDexTrade.getGasLimit(tradeStruct)) || estimatedGas;
            const gasFeeInfo = getGasFeeInfo(gasLimit, gasPriceInfo);
            return new XyDexTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo
                },
                fullOptions.providerAddress
            );
        } catch {
            return new XyDexTrade(tradeStruct, fullOptions.providerAddress);
        }
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
            slippage: options.slippageTolerance * 100
        };

        const trade = await this.httpClient.get<XyQuoteResponse>(`${XY_API_ENDPOINT}/quote`, {
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
}
