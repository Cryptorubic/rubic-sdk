import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { InsufficientFundsGasPriceValueError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BitcoinBlockchainName, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getSolanaFee } from 'src/features/common/utils/get-solana-fee';
import { BitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';

import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { RubicStep } from '../../common/models/rubicStep';
import { TradeInfo } from '../../common/models/trade-info';
import { LifiCrossChainSupportedBlockchain } from '../constants/lifi-cross-chain-supported-blockchain';
import { LifiCrossChainTradeConstructor } from '../models/lifi-cross-chain-trade-constructor';
import { Estimate, GasCost } from '../models/lifi-fee-cost';
import { Route } from '../models/lifi-route';
import { LifiTransactionRequest } from '../models/lifi-transaction-request';
import { LifiApiService } from '../services/lifi-api-service';

export class LifiBitcoinCrossChainTrade extends BitcoinCrossChainTrade {
    /** @internal */
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    private readonly route: Route;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType: BridgeType;

    public readonly priceImpact: number | null;

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    private get fromBlockchain(): LifiCrossChainSupportedBlockchain {
        return this.from.blockchain as LifiCrossChainSupportedBlockchain;
    }

    public readonly memo: string;

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            throw new Error('Solana contract is not implemented yet');
        }
        return rubicProxyContractAddress[this.fromBlockchain].gateway;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    protected override get amountToCheck(): string {
        return Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals);
    }

    constructor(
        crossChainTrade: LifiCrossChainTradeConstructor<BitcoinBlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, useProxy, apiQuote, apiResponse);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.memo = crossChainTrade.memo!;

        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.priceImpact = crossChainTrade.priceImpact;
        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.bridgeType = crossChainTrade.bridgeType;
    }

    // @TODO API
    protected async getTransactionConfigAndAmount(receiverAddress?: string): Promise<{
        config: { data: string; value: string; to: string };
        amount: string;
    }> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: this.walletAddress,
                toAddress: receiverAddress || this.walletAddress
            },
            execution: {
                status: 'NOT_STARTED',
                process: [
                    {
                        message: 'Preparing transaction.',
                        startedAt: Date.now(),
                        status: 'STARTED',
                        type: 'CROSS_CHAIN'
                    }
                ]
            }
        };

        try {
            const rubicFee = getSolanaFee(this.from);
            const swapResponse: { transactionRequest: LifiTransactionRequest; estimate: Estimate } =
                await LifiApiService.getQuote(
                    step.action.fromChainId,
                    step.action.toChainId,
                    step.action.fromToken.symbol,
                    step.action.toToken.symbol,
                    this.from.stringWeiAmount,
                    step.action.fromAddress,
                    step.action.toAddress,
                    step.action.slippage,
                    rubicFee ? rubicFee : undefined
                );
            return {
                config: swapResponse.transactionRequest,
                amount: swapResponse.estimate.toAmountMin
            };
        } catch (err) {
            if (
                err.error?.message?.includes(
                    'None of the available routes could successfully generate a tx'
                )
            ) {
                const enoughBalance = await this.checkEnoughBalance(step.estimate.gasCosts?.[0]);

                if (!enoughBalance) {
                    throw new InsufficientFundsGasPriceValueError();
                }
            }
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    private async checkEnoughBalance(gasCosts?: GasCost): Promise<boolean> {
        const web3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);

        const userWeiBalance = await web3Public.getBalance(this.walletAddress);

        if (gasCosts) {
            const fromAmounWithGasCosts = this.from.weiAmount.plus(gasCosts.amount);
            if (userWeiBalance.lte(fromAmounWithGasCosts)) {
                return false;
            }
        }

        return userWeiBalance.lte(this.from.weiAmount);
    }
}
