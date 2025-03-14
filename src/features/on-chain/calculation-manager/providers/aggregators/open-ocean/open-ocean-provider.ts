import BigNumber from 'bignumber.js';
import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import pTimeout from 'src/common/utils/p-timeout';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import {
    OpenoceanOnChainSupportedBlockchain,
    openoceanOnChainSupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import { OpenOceanEvmTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-evm-trade-struct';
import { OpenOceanSuiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-sui-trade-struct';
import { OpenOceanOnChainFactory } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/open-ocean-on-chain-factory';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';

import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { OpenOceanQuoteResponse } from './models/open-ocean-quote-response';
import { OpenOceanApiService } from './services/open-ocean-api-service';

export class OpenOceanProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return openoceanOnChainSupportedBlockchains.some(item => item === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            // Uncomment after OO answer
            // if (from.blockchain === BLOCKCHAIN_NAME.SUI) {
            //     checkUnsupportedReceiverAddress(
            //         options?.receiverAddress,
            //         options?.fromAddress || this.getWalletAddress(from.blockchain)
            //     );
            // }
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const quoteResponse = await pTimeout(
                OpenOceanApiService.fetchQuoteData(
                    fromWithoutFee as PriceTokenAmount<OpenoceanOnChainSupportedBlockchain>,
                    toToken,
                    options.slippageTolerance
                ),
                7_000
            );

            if ([500, 400].includes(quoteResponse.code)) {
                return {
                    type: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
                    error: new RubicSdkError(quoteResponse.error)
                };
            }

            const toWeiAmount = new BigNumber(quoteResponse.data.outAmount);

            if (toWeiAmount.lte(0)) throw new NotSupportedTokensError();

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: toWeiAmount
            });

            const tradeStruct: OpenOceanEvmTradeStruct | OpenOceanSuiTradeStruct = {
                from,
                to,
                gasFeeInfo: await this.getGasFeeInfo(from, quoteResponse),
                slippageTolerance: options.slippageTolerance!,
                path: [from, to],
                useProxy: options.useProxy,
                proxyFeeInfo,
                fromWithoutFee,
                withDeflation: options.withDeflation
            };

            return OpenOceanOnChainFactory.createTrade(
                from.blockchain,
                tradeStruct,
                options.providerAddress
            );
        } catch (error) {
            return {
                type: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
                error
            };
        }
    }

    protected override async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        quote: OpenOceanQuoteResponse
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);
            const gasLimit = new BigNumber(quote.data.estimatedGas);

            return getGasFeeInfo(gasPriceInfo, { gasLimit });
        } catch {
            return null;
        }
    }
}
