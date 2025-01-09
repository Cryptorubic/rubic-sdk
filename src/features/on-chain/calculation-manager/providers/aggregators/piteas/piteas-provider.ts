import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import { piteasOnChainSupportedBlockchains } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/constants/piteas-on-chain-supported-blockchains';
import { PiteasQuoteRequestParams } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/models/piteas-quote';
import { PiteasTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/models/piteas-trade-struct';
import { PiteasApiService } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/piteas-api-service';
import { PiteasTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/piteas/piteas-trade';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';

import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';

export class PiteasProvider extends AggregatorOnChainProvider {
    private readonly defaultOptions: RequiredOnChainCalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    public readonly tradeType = ON_CHAIN_TRADE_TYPE.PITEAS;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return piteasOnChainSupportedBlockchains.some(
            supportedNetwork => supportedNetwork === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const fromAddress =
                options?.useProxy || this.defaultOptions.useProxy
                    ? rubicProxyContractAddress[from.blockchain].gateway
                    : this.getWalletAddress(from.blockchain);

            const fullOptions = combineOptions(options, {
                ...this.defaultOptions,
                fromAddress
            });

            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, {
                ...fullOptions
            });

            const quoteRequestParams: PiteasQuoteRequestParams = {
                tokenInAddress: from.isNative ? 'PLS' : from.address,
                tokenInChainId: blockchainId[from.blockchain],
                tokenOutAddress: toToken.isNative ? 'PLS' : toToken.address,
                tokenOutChainId: blockchainId[from.blockchain],
                amount: fromWithoutFee.stringWeiAmount,
                allowedSlippage: 0.5,
                ...(options?.fromAddress && { account: options.fromAddress })
            };

            const { destAmount, gasUseEstimate, methodParameters } =
                await PiteasApiService.fetchQuote(quoteRequestParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(destAmount, toToken.decimals)
            });

            const tradeStruct: PiteasTradeStruct = {
                from,
                to,
                slippageTolerance: fullOptions.slippageTolerance,
                path: [from, to],
                gasFeeInfo: await this.getGasFeeInfo(from, gasUseEstimate),
                useProxy: fullOptions.useProxy,
                proxyFeeInfo,
                fromWithoutFee,
                withDeflation: fullOptions.withDeflation,
                usedForCrossChain: fullOptions.usedForCrossChain,
                methodParameters
            };

            return new PiteasTrade(tradeStruct, fullOptions.providerAddress, quoteRequestParams);
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.PITEAS,
                error: err
            };
        }
    }

    protected override async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        gasLimit: number
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);

            return getGasFeeInfo(gasPriceInfo, { gasLimit: new BigNumber(gasLimit) });
        } catch {
            return null;
        }
    }
}
