import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { PiteasQuoteRequestParams } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/models/piteas-quote';
import { PiteasApiService } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/piteas-api-service';
import { PiteasTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/piteas-trade';

import { GasFeeInfo } from '../../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { getGasPriceInfo } from '../../../common/utils/get-gas-price-info';

export class PiteasProvider extends AggregatorOnChainProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    private readonly defaultOptions: RequiredOnChainCalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    public readonly tradeType = ON_CHAIN_TRADE_TYPE.PITEAS;

    protected isSupportedBlockchain(): boolean {
        return true;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<PiteasTrade> {
        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.getWalletAddress(from.blockchain);

        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress
        });

        const quoteRequestParams: PiteasQuoteRequestParams = {
            tokenInAddress: from.isNative ? 'PLS' : from.address,
            tokenInChainId: blockchainId[from.blockchain],
            tokenOutAddress: toToken.isNative ? 'PLS' : toToken.address,
            tokenOutChainId: blockchainId[from.blockchain],
            amount: from.stringWeiAmount,
            allowedSlippage: 0.5,
            ...(options?.fromAddress && { account: options.fromAddress })
        };

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, {
            ...fullOptions
        });

        const { destAmount, gasUseEstimate, methodParameters } = await PiteasApiService.fetchQuote(
            quoteRequestParams
        );

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: Web3Pure.fromWei(destAmount, toToken.decimals)
        });

        const tradeStruct: EvmOnChainTradeStruct = {
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            path: [from, to],
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain
        };

        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);
            const gasLimit =
                (await PiteasTrade.getGasLimit(tradeStruct, methodParameters)) || gasUseEstimate;
            const gasFeeInfo = getGasFeeInfo(gasLimit, gasPriceInfo);
            return new PiteasTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo
                },
                fullOptions.providerAddress,
                quoteRequestParams
            );
        } catch {
            return new PiteasTrade(tradeStruct, fullOptions.providerAddress, quoteRequestParams);
        }
    }

    protected getGasFeeInfo(): Promise<GasFeeInfo | null> {
        return Promise.resolve(null);
    }
}
