import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    TeleSwapCcrSupportedChain,
    teleSwapCcrSupportedChains
} from './constants/teleswap-ccr-supported-chains';
import { TeleSwapUtilsService } from './services/teleswap-utils-service';
import { TeleSwapCcrFactory } from './teleswap-ccr-factory';

export class TeleSwapCcrProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.TELE_SWAP;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return teleSwapCcrSupportedChains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        try {
            if (from.blockchain === BLOCKCHAIN_NAME.BITCOIN && toToken.isWrapped) {
                throw new NotSupportedTokensError();
            }

            const useProxy = options?.useProxy?.[this.type] ?? true;
            const feeInfo = await this.getFeeInfo(
                from.blockchain as EvmBlockchainName,
                options.providerAddress,
                from,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const teleSwapSdk = await Injector.teleSwapSdkInstance;

            await teleSwapSdk.initNetworksConnection();

            const toWeiAmount = await TeleSwapUtilsService.calculateOutputWeiAmount(
                fromWithoutFee as PriceTokenAmount<TeleSwapCcrSupportedChain>,
                toToken as PriceToken<TeleSwapCcrSupportedChain>,
                teleSwapSdk
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: toWeiAmount
            });

            const routePath = await this.getRoutePath(from, to);

            const trade = TeleSwapCcrFactory.createTrade(from.blockchain, {
                crossChainTrade: {
                    from,
                    to,
                    teleSwapSdk,
                    feeInfo,
                    gasData: null,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    slippage: options.slippageTolerance
                },
                providerAddress: options.providerAddress,
                useProxy,
                routePath
            });

            return {
                trade,
                tradeType: this.type
            };
        } catch (err) {
            return {
                trade: null,
                tradeType: this.type,
                error: err
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: Partial<EvmBlockchainName>,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    protected async getRoutePath(
        from: PriceTokenAmount,
        to: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [
            {
                type: 'cross-chain',
                provider: CROSS_CHAIN_TRADE_TYPE.TELE_SWAP,
                path: [from, to]
            }
        ];
    }
}
