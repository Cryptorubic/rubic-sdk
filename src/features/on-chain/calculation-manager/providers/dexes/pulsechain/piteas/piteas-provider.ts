import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import {
    PiteasQuoteRequestParams,
    PiteasSuccessQuoteResponse
} from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/models/piteas-quote';
import { PiteasTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/piteas/piteas-trade';

export class PiteasProvider extends EvmOnChainProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    private readonly defaultOptions: RequiredOnChainCalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PITEAS;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<PiteasTrade> {
        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.walletAddress;

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
            allowedSlippage: 0.5
        };

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const { destAmount, gasUseEstimate, methodParameters } =
            await this.httpClient.get<PiteasSuccessQuoteResponse>('https://api.piteas.io/quote', {
                headers: { Referer: 'app.rubic.exchange' },
                params: { ...quoteRequestParams }
            });

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(destAmount)
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
            const gasPriceInfo = await this.getGasPriceInfo();
            const gasLimit =
                (await PiteasTrade.getGasLimit(tradeStruct, methodParameters)) || gasUseEstimate;
            const gasFeeInfo = getGasFeeInfo(gasLimit, gasPriceInfo);
            return new PiteasTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo
                },
                fullOptions.providerAddress,
                methodParameters
            );
        } catch {
            return new PiteasTrade(tradeStruct, fullOptions.providerAddress, methodParameters);
        }
    }
}
