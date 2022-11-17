import {
    OnChainCalculationOptions,
    RequiredOnChainCalculationOptions
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { zrxApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/constants';
import { ZrxQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/models/zrx-quote-request';
import { ZrxQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/models/zrx-types';
import { getZrxApiBaseUrl } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/utils';
import BigNumber from 'bignumber.js';
import { ZrxTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/zrx-trade';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { ZrxTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/models/zrx-trade-struct';

export abstract class ZrxAbstractProvider extends EvmOnChainProvider {
    private readonly defaultOptions: RequiredOnChainCalculationOptions = evmProviderDefaultOptions;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ZRX;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getZrxApiBaseUrl(this.blockchain);
    }

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
        const apiTradeData = await this.getTradeData(quoteParams);

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: new BigNumber(apiTradeData.buyAmount)
        });

        const tradeStruct: ZrxTradeStruct = {
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            apiTradeData,
            path: [from, to],
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new ZrxTrade(tradeStruct, fullOptions.providerAddress);
        }

        const gasPriceInfo = await this.getGasPriceInfo();
        const gasLimit = (await ZrxTrade.getGasLimit(tradeStruct)) || apiTradeData.gas;
        const gasFeeInfo = await getGasFeeInfo(gasLimit, gasPriceInfo);

        return new ZrxTrade(
            {
                ...tradeStruct,
                gasFeeInfo
            },
            fullOptions.providerAddress
        );
    }

    /**
     * Fetches zrx data from api.
     */
    private getTradeData(params: ZrxQuoteRequest): Promise<ZrxQuoteResponse> {
        return this.httpClient.get<ZrxQuoteResponse>(`${this.apiBaseUrl}swap/v1/quote`, params);
    }
}
