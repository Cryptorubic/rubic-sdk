import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { OdosOnChainTradeStruct } from './models/odos-on-chain-trade-types';
import { odosSupportedBlockchains } from './models/odos-supported-blockchains';
import { OdosOnChainTrade } from './odos-on-chain-trade';
import { OdosOnChainApiService } from './services/odos-on-chain-api-service';
import { OdosOnChainParser } from './services/odos-on-chain-parser';

export class OdosOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.ODOS;

    protected isSupportedBlockchain(blockchainName: BlockchainName): boolean {
        return odosSupportedBlockchains.some(chain => chain === blockchainName);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError(`Odos doesn't support ${from.blockchain} chain!`);
        }

        const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            from.blockchain
        ).address;

        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const path = this.getRoutePath(from, toToken);

            const bestRouteRequestBody = OdosOnChainParser.getBestRouteBody({
                from,
                toToken,
                options,
                swappersBlacklist: [],
                swappersWhitelist: []
            });

            const { pathId, outAmounts, gasEstimate } = await OdosOnChainApiService.getBestRoute(
                bestRouteRequestBody
            );
            const { transaction: tx } = await OdosOnChainApiService.getSwapTx({
                pathId,
                userAddr: options.fromAddress ?? walletAddress ?? FAKE_WALLET_ADDRESS
            });

            const providerGateway = tx!.to;

            const outputAmount = outAmounts[0] as string;

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(outputAmount)
            });

            const tradeStruct: OdosOnChainTradeStruct = {
                from,
                to,
                fromWithoutFee,
                proxyFeeInfo,
                gasFeeInfo: {
                    gasLimit: new BigNumber(gasEstimate)
                },
                slippageTolerance: options.slippageTolerance,
                useProxy: options.useProxy,
                withDeflation: options.withDeflation,
                path,
                bestRouteRequestBody
            };

            const gasFeeInfo =
                options.gasCalculation === 'calculate'
                    ? await this.getGasFeeInfo(tradeStruct, providerGateway)
                    : null;

            return new OdosOnChainTrade(
                {
                    ...tradeStruct,
                    gasFeeInfo
                },
                options.providerAddress,
                providerGateway!
            );
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.ODOS,
                error: err
            };
        }
    }

    protected async getGasFeeInfo(
        tradeStruct: OdosOnChainTradeStruct,
        providerGateway: string
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit = tradeStruct.gasFeeInfo?.gasLimit
                ? tradeStruct.gasFeeInfo?.gasLimit
                : await OdosOnChainTrade.getGasLimit(tradeStruct, providerGateway);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }
}
