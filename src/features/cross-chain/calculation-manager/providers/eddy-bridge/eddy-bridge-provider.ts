import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { calculateRates } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/utils/calculate-rates';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    EddyBridgeSupportedChain,
    eddyBridgeSupportedChains
} from './constants/eddy-bridge-supported-chains';
import { EDDY_BRIDGE_LIMITS } from './constants/swap-limits';
import { EddyBridgeTrade } from './eddy-bridge-trade';
import { EddyBridgeApiService } from './services/eddy-bridge-api-service';
import { EddyBridgeContractService } from './services/eddy-bridge-contract-service';
import { eddyRoutingDirection } from './utils/eddy-bridge-routing-directions';

export class EddyBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE;

    public isSupportedBlockchain(fromBlockchain: EvmBlockchainName): boolean {
        return eddyBridgeSupportedChains.some(chain => chain === fromBlockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as EddyBridgeSupportedChain;

        const useProxy = false;
        const walletAddress = this.getWalletAddress(fromBlockchain) || FAKE_WALLET_ADDRESS;

        try {
            checkUnsupportedReceiverAddress(
                options?.receiverAddress,
                options?.fromAddress || walletAddress
            );
            const routingDirection = eddyRoutingDirection(from, toToken);

            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const [eddySlippage, outputAmount] = await Promise.all([
                EddyBridgeContractService.getEddySlipage(),
                calculateRates(fromWithoutFee, toToken, options.slippageTolerance)
            ]);

            const to = await PriceTokenAmount.createToken({
                ...toToken.asStruct,
                weiAmount: new BigNumber(outputAmount)
            });

            const trade = new EddyBridgeTrade({
                crossChainTrade: {
                    feeInfo,
                    from: fromWithoutFee,
                    gasData: await this.getGasData(from),
                    to,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    slippage: eddySlippage + options.slippageTolerance,
                    routingDirection,
                    quoteOptions: options
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to),
                useProxy
            });

            return this.getCalculationResult(fromWithoutFee, trade);
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);
            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    private async getCalculationResult(
        fromWithoutFee: PriceTokenAmount<EvmBlockchainName>,
        trade: EddyBridgeTrade
    ): Promise<CalculationResult> {
        const limits = EDDY_BRIDGE_LIMITS.find(info => fromWithoutFee.isEqualTo(info));
        if (!limits) {
            throw new NotSupportedTokensError();
        }
        let hasEnoughCapacity: boolean = true;

        if (fromWithoutFee.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN) {
            try {
                const maxAmountWei = await EddyBridgeApiService.getWeiTokenLimitInForeignChain(
                    fromWithoutFee
                );
                hasEnoughCapacity = fromWithoutFee.weiAmount.lte(maxAmountWei);
            } catch {}
        }

        if (fromWithoutFee.tokenAmount.lt(limits.min)) {
            return {
                trade,
                error: new MinAmountError(limits.min, fromWithoutFee.symbol),
                tradeType: this.type
            };
        }
        if (fromWithoutFee.tokenAmount.gt(limits.max) || !hasEnoughCapacity) {
            return {
                trade,
                error: new MaxAmountError(limits.max, fromWithoutFee.symbol),
                tradeType: this.type
            };
        }

        return { trade, tradeType: this.type };
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }

    protected async getFeeInfo(
        fromBlockchain: EddyBridgeSupportedChain,
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
}
