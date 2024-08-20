import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { EddyFinanceProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-provider';

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
import { findCompatibleZrc20TokenAddress } from './utils/find-transit-token-address';

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
                ratioToAmount,
                gasFeeInDestTokenUnits
            );

            const to = await PriceTokenAmount.createToken({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });

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
                    feeInfo,
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
        ratioToAmount: number,
        gasFeeInDestTokenUnits: BigNumber
    ): Promise<BigNumber> {
        const isSwapFromZetachain = from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN;
        const isSwapToZetachain = toToken.blockchain === BLOCKCHAIN_NAME.ZETACHAIN;

        if (isDirectBridge(from, toToken)) {
            const toAmount = from.tokenAmount
                .multipliedBy(ratioToAmount)
                .minus(gasFeeInDestTokenUnits);

            return toAmount;
        }

        // Zetachain(ZETA) -> Ethereum(ETH), Zetachain(BNB) -> Bsc(USDT)
        if (isSwapFromZetachain) {
            const fromZrc20Token = new PriceTokenAmount({
                ...from.asStruct,
                tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
            });
            const toZrc20Token = await PriceToken.createToken({
                address: findCompatibleZrc20TokenAddress(toToken),
                blockchain: BLOCKCHAIN_NAME.ZETACHAIN
            });
            const toAmount = await this.calculateOnChainToAmount(
                fromZrc20Token,
                toZrc20Token,
                options
            );

            return toAmount.minus(gasFeeInDestTokenUnits);
        }

        // Ethereum(ETH) -> Zetachain(ZETA), Bsc(USDT) -> Zetachain(BNB)
        if (isSwapToZetachain) {
            const fromZrc20Token = await PriceTokenAmount.createToken({
                address: findCompatibleZrc20TokenAddress(from),
                blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
                tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
            });
            const toAmount = await this.calculateOnChainToAmount(fromZrc20Token, toToken, options);

            return toAmount;
        }

        // BSC <-> Ethereum
        const fromZrc20Token = await PriceTokenAmount.createToken({
            address: findCompatibleZrc20TokenAddress(from),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
            tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
        });
        const toZrc20Token = await PriceToken.createToken({
            address: findCompatibleZrc20TokenAddress(toToken),
            blockchain: BLOCKCHAIN_NAME.ZETACHAIN
        });
        const toAmount = await this.calculateOnChainToAmount(fromZrc20Token, toZrc20Token, options);

        return toAmount.minus(gasFeeInDestTokenUnits);
    }

    private async calculateOnChainToAmount(
        fromZrc20Token: PriceTokenAmount<EvmBlockchainName>,
        toZrc20Token: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<BigNumber> {
        const calcData = await new EddyFinanceProvider().calculate(fromZrc20Token, toZrc20Token, {
            ...options,
            gasCalculation: 'disabled',
            useProxy: false
        });

        return calcData.to.tokenAmount;
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
