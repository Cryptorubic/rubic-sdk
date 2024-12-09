import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { zrxApiParams } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/constants';
import {
    ZeroXSupportedBlockchains,
    zeroXSupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/constants/zrx-supported-blockchains';
import { ZrxQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/models/zrx-quote-request';
import { ZrxTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/models/zrx-trade-struct';
import { ZrxApiService } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/zrx-api-service';
import { ZrxTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/zrx/zrx-trade';
import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';

import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { ZrxQuoteResponse } from './models/zrx-types';

export class ZrxProvider extends AggregatorOnChainProvider {
    private readonly defaultOptions: RequiredOnChainCalculationOptions = evmProviderDefaultOptions;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return zeroXSupportedBlockchains.some(item => item === blockchain);
    }

    public tradeType = ON_CHAIN_TRADE_TYPE.ZRX;

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<ZrxTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const fromClone = createTokenNativeAddressProxy(
            fromWithoutFee,
            zrxApiParams.nativeTokenAddress
        );
        const toClone = createTokenNativeAddressProxy(toToken, zrxApiParams.nativeTokenAddress);

        const affiliateAddress = fullOptions.zrxAffiliateAddress;
        const quoteParams: ZrxQuoteRequest = {
            params: {
                sellToken: fromClone.address,
                buyToken: toClone.address,
                sellAmount: fromClone.stringWeiAmount,
                slippagePercentage: fullOptions.slippageTolerance.toString(),
                ...(affiliateAddress && { affiliateAddress })
            }
        };
        const apiTradeData = await ZrxApiService.getTradeData(
            quoteParams,
            from.blockchain as ZeroXSupportedBlockchains
        );

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(apiTradeData.buyAmount)
        });

        const tradeStruct: ZrxTradeStruct = {
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: await this.getGasFeeInfo(from, apiTradeData),
            path: [from, to],
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            ...(affiliateAddress && { affiliateAddress }),
            routerAddress: apiTradeData.to
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new ZrxTrade(tradeStruct, fullOptions.providerAddress);
        }

        return new ZrxTrade(tradeStruct, fullOptions.providerAddress);
    }

    /**
     * Fetches zrx data from api.
     */

    protected override async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        quote: ZrxQuoteResponse
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);
            const gasLimit = new BigNumber(quote.gas);

            return getGasFeeInfo(gasPriceInfo, { gasLimit });
        } catch {
            return null;
        }
    }
}
