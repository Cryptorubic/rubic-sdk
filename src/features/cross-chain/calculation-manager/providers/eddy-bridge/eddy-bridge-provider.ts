import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

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
import { eddyRoutingDirection, isDirectBridge } from './utils/eddy-bridge-routing-directions';
import {
    EDDY_CALCULATION_TYPES,
    EddyBridgeCalculationFactory,
    EddyCalculationType
} from './utils/eddy-calculation-factory';

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

            const [eddySlippage, eddyFee, gasFeeInDestTokenUnits] = await Promise.all([
                EddyBridgeContractService.getEddySlipage(),
                EddyBridgeContractService.getPlatformFee(),
                EddyBridgeContractService.getGasInDestTokenUnits(toToken)
            ]);
            const ratioToAmount = 1 - eddyFee;
            const toAmount = await this.getToTokenAmount(
                fromWithoutFee,
                toToken,
                options,
                ratioToAmount
            );

            const [to, nativeSrcChainToken] = await Promise.all([
                PriceTokenAmount.createToken({
                    ...toToken.asStruct,
                    tokenAmount: toAmount
                }),
                PriceToken.createFromToken(nativeTokensList[from.blockchain])
            ]);

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await EddyBridgeTrade.getGasData({
                          feeInfo,
                          from: fromWithoutFee,
                          toToken: to,
                          providerAddress: options.providerAddress,
                          slippage: options.slippageTolerance,
                          routingDirection
                      })
                    : null;

            const trade = new EddyBridgeTrade({
                crossChainTrade: {
                    feeInfo: {
                        ...feeInfo,
                        provider: {
                            cryptoFee: {
                                amount: gasFeeInDestTokenUnits,
                                token: nativeSrcChainToken
                            }
                        }
                    },
                    from: fromWithoutFee,
                    gasData,
                    to,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    slippage: eddySlippage,
                    prevGasFeeInDestTokenUnits: gasFeeInDestTokenUnits,
                    routingDirection,
                    ratioToAmount
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to)
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
            return { trade, tradeType: this.type };
            // throw new NotSupportedTokensError();
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

    private async getToTokenAmount(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions,
        ratioToAmount: number
    ): Promise<BigNumber> {
        const calculationType = this.getCalculationType(from, toToken);
        const calculationFactory = new EddyBridgeCalculationFactory(
            from,
            toToken,
            calculationType,
            options,
            ratioToAmount
        );
        const toAmount = calculationFactory.calculatePureToAmount();

        return toAmount;
    }

    private getCalculationType(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): EddyCalculationType {
        if (isDirectBridge(from, toToken)) {
            return EDDY_CALCULATION_TYPES.DIRECT_BRIDGE;
        }
        if (from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN) {
            return EDDY_CALCULATION_TYPES.SWAP_FROM_ZETACHAIN;
        }
        if (toToken.blockchain === BLOCKCHAIN_NAME.ZETACHAIN) {
            return EDDY_CALCULATION_TYPES.SWAP_TO_ZETACHAIN;
        }
        return EDDY_CALCULATION_TYPES.SWAP_BETWEEN_OTHER_CHAINS;
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
