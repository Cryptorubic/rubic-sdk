import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { symbiosisSupportedBlockchains } from 'src/features/common/providers/symbiosis/constants/symbiosis-supported-blockchains';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
import { SymbiosisParser } from 'src/features/common/providers/symbiosis/services/symbiosis-parser';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChain } from '../../common/on-chain-aggregator/on-chain-aggregator-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { SymbiosisTradeStruct } from './models/symbiosis-on-chain-trade-types';
import { SymbiosisOnChainTrade } from './symbiosis-on-chain-trade';

export class SymbiosisOnChainProvider extends AggregatorOnChain {
    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return symbiosisSupportedBlockchains.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError(`Symbiosis doesn't support ${from.blockchain} chain!`);
        }

        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const path = this.getRoutePath(from, toToken);

            const swapBody = await SymbiosisParser.getSwapRequestBody(fromWithoutFee, toToken, {
                slippage: options.slippageTolerance
            });
            const {
                approveTo: providerGateway,
                tokenAmountOut: { amount: toTokenAmount }
            } = await SymbiosisApiService.getSwapTx(swapBody);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(toTokenAmount)
            });

            const tradeStruct: SymbiosisTradeStruct = {
                from: from as PriceTokenAmount<EvmBlockchainName>,
                to: to as PriceTokenAmount<EvmBlockchainName>,
                fromWithoutFee: fromWithoutFee as PriceTokenAmount<EvmBlockchainName>,
                proxyFeeInfo,
                gasFeeInfo: {
                    gasLimit: undefined
                },
                slippageTolerance: options.slippageTolerance,
                useProxy: options.useProxy,
                withDeflation: options.withDeflation,
                path
            };

            const gasFeeInfo =
                options.gasCalculation === 'calculate'
                    ? await this.getGasFeeInfo(tradeStruct, providerGateway)
                    : null;

            return new SymbiosisOnChainTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo
                },
                options.providerAddress,
                providerGateway
            );
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
                error: err
            };
        }
    }

    protected async getGasFeeInfo(
        tradeStruct: SymbiosisTradeStruct,
        providerGateway: string
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit = await SymbiosisOnChainTrade.getGasLimit(tradeStruct, providerGateway);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }
}
