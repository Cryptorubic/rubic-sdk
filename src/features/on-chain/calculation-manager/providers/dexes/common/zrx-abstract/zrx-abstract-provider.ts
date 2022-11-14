import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
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
import { ZrxCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/models/zrx-calculation-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';

export abstract class ZrxAbstractProvider extends EvmOnChainProvider {
    private readonly defaultOptions: ZrxCalculationOptions = {
        slippageTolerance: 0.02,
        gasCalculation: 'calculate',
        providerAddress: EvmWeb3Pure.EMPTY_ADDRESS,
        useProxy: false
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

        const tradeStruct = {
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            apiTradeData,
            path: [from, to],
            proxyFeeInfo,
            fromWithoutFee
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new ZrxTrade(tradeStruct, fullOptions.useProxy, fullOptions.providerAddress);
        }

        const gasPriceInfo = await this.getGasPriceInfo();
        const gasLimit =
            (await ZrxTrade.getGasLimit(tradeStruct, fullOptions.useProxy)) || apiTradeData.gas;
        const gasFeeInfo = await getGasFeeInfo(gasLimit, gasPriceInfo);

        return new ZrxTrade(
            {
                ...tradeStruct,
                gasFeeInfo
            },
            fullOptions.useProxy,
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
