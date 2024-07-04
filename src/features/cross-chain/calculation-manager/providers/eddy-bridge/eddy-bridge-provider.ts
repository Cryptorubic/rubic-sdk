import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    NotSupportedBlockchain,
    NotSupportedTokensError
} from 'src/common/errors';
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
import { TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS } from './constants/eddy-bridge-contract-addresses';
import {
    EddyBridgeSupportedChain,
    eddyBridgeSupportedChains,
    EddyBridgeSupportedTokens
} from './constants/eddy-bridge-supported-chains';
import { EDDY_BRIDGE_LIMITS } from './constants/swap-limits';
import { EddyBridgeTrade } from './eddy-bridge-trade';
import { EddyBridgeApiService } from './services/eddy-bridge-api-service';
import { EddyBridgeContractService } from './services/eddy-bridge-contract-service';
import {
    EddyRoutingDirection,
    eddyRoutingDirection,
    ERD
} from './utils/eddy-bridge-routing-directions';

export class EddyBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE;

    private routingDirection!: EddyRoutingDirection;

    private prevGasAmountInNonZetaChain!: BigNumber;

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
            this.skipkNotSupportedRoutes(from, toToken);
            this.routingDirection = eddyRoutingDirection(from, toToken);

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

            const [eddySlippage, toAmount] = await Promise.all([
                EddyBridgeContractService.getEddySlipage(),
                this.getToTokenAmount(fromWithoutFee, toToken, options)
            ]);

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
                          routingDirection: this.routingDirection
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
                    prevGasAmountInNonZetaChain: this.prevGasAmountInNonZetaChain,
                    routingDirection: this.routingDirection
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
        const limits = EDDY_BRIDGE_LIMITS[fromWithoutFee.symbol as EddyBridgeSupportedTokens];
        let hasEnoughCapacity: boolean = true;

        if (fromWithoutFee.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN) {
            try {
                const maxAmountWei = await EddyBridgeApiService.getWeiTokenLimitInForeignChain(
                    fromWithoutFee.symbol
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
        options: RequiredCrossChainOptions
    ): Promise<BigNumber> {
        const eddyFee = await EddyBridgeContractService.getPlatformFee();
        const ratioToAmount = 1 - eddyFee;

        if (this.routingDirection === ERD.ZETA_TOKEN_TO_ANY_CHAIN_NATIVE) {
            const gasInTargetChainNonWei = await EddyBridgeContractService.getGasInTargetChain(
                from
            );
            this.prevGasAmountInNonZetaChain = gasInTargetChainNonWei;

            return from.tokenAmount.multipliedBy(ratioToAmount).minus(gasInTargetChainNonWei);
        } else if (this.routingDirection === ERD.ZETA_NATIVE_TO_ANY_CHAIN_NATIVE) {
            const to = new PriceToken({
                address: TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS[toToken.symbol] as string,
                blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
                decimals: 18,
                name: toToken.symbol,
                price: new BigNumber(0),
                symbol: toToken.symbol
            });
            const fromWithEddyBridgeFee = new PriceTokenAmount({
                ...from.asStruct,
                tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
            });
            const calcData = await new EddyFinanceProvider().calculate(fromWithEddyBridgeFee, to, {
                ...options,
                gasCalculation: 'disabled',
                useProxy: false
            });

            return calcData.to.tokenAmount;
            // BNB or ETH -> ZETA
        } else {
            const fromTokenInZetaChain = new PriceTokenAmount({
                address: TOKEN_SYMBOL_TO_ZETACHAIN_ADDRESS[from.symbol] as string,
                blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
                decimals: 18,
                name: from.symbol,
                price: new BigNumber(0),
                symbol: from.symbol,
                tokenAmount: from.tokenAmount.multipliedBy(ratioToAmount)
            });
            const calcData = await new EddyFinanceProvider().calculate(
                fromTokenInZetaChain,
                toToken,
                {
                    ...options,
                    gasCalculation: 'disabled',
                    useProxy: false
                }
            );
            return calcData.to.tokenAmount;
        }
    }

    private skipkNotSupportedRoutes(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): void {
        const supportedTokens = ['eth', 'bnb', 'zeta'];

        // Prevents bridges BSC <-> Ethereum
        if (
            from.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN &&
            toToken.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN
        ) {
            throw new NotSupportedBlockchain();
        }
        // Only gas-token(BNB, ETH) can be bridged from supported chains in ZetaChain(ZETA)
        if (
            from.blockchain !== BLOCKCHAIN_NAME.ZETACHAIN &&
            (!from.isNative || !toToken.isNative)
        ) {
            throw new NotSupportedTokensError();
        }
        // Bridge from ZetaChain available only for ETH.ETH, BNB.BNB, ZETA
        if (
            from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN &&
            !supportedTokens.includes(from.symbol.toLowerCase())
        ) {
            throw new NotSupportedTokensError();
        }
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