import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-calculation-options';
import { createTokenNativeAddressProxy } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/utils/token-native-address-proxy';
import { zrxApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/zrx-abstract/constants';
import { ZrxQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/zrx-abstract/models/zrx-quote-request';
import { ZrxQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/zrx-abstract/models/zrx-types';
import { getZrxApiBaseUrl } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/zrx-abstract/utils';
import BigNumber from 'bignumber.js';
import { ZrxTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/zrx-abstract/zrx-trade';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { ZrxCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/zrx-abstract/models/zrx-calculation-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';

export abstract class ZrxAbstractProvider extends EvmOnChainProvider {
    protected readonly gasMargin = 1.4;

    private readonly defaultOptions: ZrxCalculationOptions = {
        slippageTolerance: 0.02,
        gasCalculation: 'calculate'
    };

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ZRX;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getZrxApiBaseUrl(this.blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<ZrxTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromClone = createTokenNativeAddressProxy(from, zrxApiParams.nativeTokenAddress);
        const toClone = createTokenNativeAddressProxy(to, zrxApiParams.nativeTokenAddress);

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

        const tradeStruct = {
            from,
            to: new PriceTokenAmount({
                ...to.asStruct,
                weiAmount: new BigNumber(apiTradeData.buyAmount)
            }),
            slippageTolerance: fullOptions.slippageTolerance,
            apiTradeData,
            path: [from, to]
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new ZrxTrade(tradeStruct);
        }

        const gasPriceInfo = await this.getGasPriceInfo();
        const gasFeeInfo = await this.getGasFeeInfo(apiTradeData.gas, gasPriceInfo);

        return new ZrxTrade({
            ...tradeStruct,
            gasFeeInfo
        });
    }

    /**
     * Fetches zrx data from api.
     */
    private getTradeData(params: ZrxQuoteRequest): Promise<ZrxQuoteResponse> {
        return this.httpClient.get<ZrxQuoteResponse>(`${this.apiBaseUrl}swap/v1/quote`, params);
    }
}
