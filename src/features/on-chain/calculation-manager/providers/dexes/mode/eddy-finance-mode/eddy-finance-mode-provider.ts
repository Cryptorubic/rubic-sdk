import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import {
    createTokenNativeAddressProxy,
    createTokenNativeAddressProxyInPathStartAndEnd
} from 'src/features/common/utils/token-native-address-proxy';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/models/gas-price-info';
import { UniswapV2TradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-struct';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';
import { EDDY_FINANCE_MODE_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/eddy-finance-mode/constants';

import { EddyFinanceModeTrade } from './eddy-finance-mode-trade';

export class EddyFinanceModeProvider extends UniswapV2AbstractProvider<EddyFinanceModeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MODE;

    public readonly UniswapV2TradeClass = EddyFinanceModeTrade;

    public readonly providerSettings = EDDY_FINANCE_MODE_PROVIDER_CONFIGURATION;

    public async calculateDifficultTrade(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        weiAmount: BigNumber,
        exact: Exact,
        options?: OnChainCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        const fullOptions = combineOptions({ ...options, useProxy: false }, this.defaultOptions);

        let weiAmountWithoutFee = weiAmount;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;

        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...fromToken.asStruct,
                    weiAmount
                }),
                fullOptions
            );
            weiAmountWithoutFee = proxyContractInfo.fromWithoutFee.weiAmount;
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
        }

        const fromProxy = createTokenNativeAddressProxy(
            fromToken,
            this.providerSettings.wethAddress
        );
        const toProxy = createTokenNativeAddressProxy(toToken, this.providerSettings.wethAddress);

        let gasPriceInfo: GasPriceInfo | undefined;
        if (fullOptions.gasCalculation !== 'disabled') {
            try {
                gasPriceInfo = await this.getGasPriceInfo();
            } catch {}
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            weiAmountWithoutFee,
            exact,
            fullOptions,
            proxyFeeInfo,
            gasPriceInfo?.gasPriceInUsd
        );

        const { from, to, fromWithoutFee } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            weiAmountWithoutFee,
            route.outputAbsoluteAmount
        );

        const wrappedPath = route.path;
        const routPoolInfo = route?.routPoolInfo;
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            wrappedPath,
            EvmWeb3Pure.nativeTokenAddress
        );
        const tradeStruct: UniswapV2TradeStruct = {
            from,
            to,
            exact,
            path,
            routPoolInfo,
            wrappedPath,
            deadlineMinutes: fullOptions.deadlineMinutes,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain
        };

        if (fullOptions.gasCalculation === 'disabled') {
            return new this.UniswapV2TradeClass(tradeStruct, fullOptions.providerAddress);
        }

        const gasFeeInfo = getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return new this.UniswapV2TradeClass(
            { ...tradeStruct, gasFeeInfo },
            fullOptions.providerAddress
        );
    }
}
