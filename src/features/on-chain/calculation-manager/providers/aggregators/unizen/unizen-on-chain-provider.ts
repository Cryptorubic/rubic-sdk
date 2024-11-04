import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { UniZenOnChainQuoteParams } from 'src/features/common/providers/unizen/models/unizen-quote-params';
import {
    UniZenCcrSupportedChain,
    uniZenCcrSupportedChains
} from 'src/features/cross-chain/calculation-manager/providers/unizen-provider/constants/unizen-ccr-supported-chains';
import {
    uniZenContractAddresses,
    UniZenContractVersion
} from 'src/features/cross-chain/calculation-manager/providers/unizen-provider/constants/unizen-contract-addresses';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import { UniZenOnChainTradeStruct } from './models/unizen-on-chain-trade-struct';
import { UniZenOnChainTrade } from './unizen-on-chain-trade';
import { UniZenOnChainUtilsService } from './utils/unizen-on-chain-utils-service';

export class UniZenOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.UNIZEN;

    public isSupportedBlockchain(blockchainName: BlockchainName): boolean {
        return uniZenCcrSupportedChains.some(chain => chain === blockchainName);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const fromBlockchain = from.blockchain as UniZenCcrSupportedChain;
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const walletAddress = options.fromAddress || FAKE_WALLET_ADDRESS;

            const quoteSendParams: UniZenOnChainQuoteParams = {
                fromTokenAddress: from.address,
                toTokenAddress: toToken.address,
                amount: fromWithoutFee.stringWeiAmount,
                sender: walletAddress,
                slippage: options.slippageTolerance
            };

            const chainId = blockchainId[from.blockchain];

            const quoteInfo = await UniZenOnChainUtilsService.getBestQuote(
                quoteSendParams,
                chainId
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(quoteInfo.toTokenAmount)
            });

            const routePath = this.getRoutePath(from, to);

            const contractVersion =
                quoteInfo.contractVersion.toLowerCase() as UniZenContractVersion;

            const unizenContractAddress = uniZenContractAddresses[contractVersion][fromBlockchain]!;

            const onChainTradeStruct: UniZenOnChainTradeStruct = {
                from,
                to,
                fromWithoutFee,
                proxyFeeInfo,
                unizenContractAddress,
                path: routePath,
                slippageTolerance: options.slippageTolerance,
                useProxy: options.useProxy,
                withDeflation: options.withDeflation,
                gasFeeInfo: null
            };

            const gasFeeInfo =
                options.gasCalculation === 'calculate'
                    ? await this.getGasFeeInfo(onChainTradeStruct)
                    : null;

            const trade = new UniZenOnChainTrade(
                {
                    ...onChainTradeStruct,
                    gasFeeInfo
                },
                options.providerAddress
            );

            return trade;
        } catch (error) {
            return {
                type: this.tradeType,
                error
            };
        }
    }

    protected async getGasFeeInfo(
        tradeStruct: UniZenOnChainTradeStruct
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit =
                tradeStruct?.gasFeeInfo?.gasLimit ||
                (await UniZenOnChainTrade.getGasLimit(tradeStruct));
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }
}
