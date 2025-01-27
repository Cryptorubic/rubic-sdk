import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    RubicSdkError,
    TooLowAmountError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getSolanaFee } from 'src/features/common/utils/get-solana-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { GetContractParamsOptions } from '../../common/models/get-contract-params-options';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { RubicStep } from '../../common/models/rubicStep';
import { TradeInfo } from '../../common/models/trade-info';
import { SolanaCrossChainTrade } from '../../common/solana-cross-chain-trade/solana-cross-chain-trade';
import { LifiCrossChainSupportedBlockchain } from '../constants/lifi-cross-chain-supported-blockchain';
import { LifiCrossChainTradeConstructor } from '../models/lifi-cross-chain-trade-constructor';
import { Estimate } from '../models/lifi-fee-cost';
import { Route } from '../models/lifi-route';
import { LifiTransactionRequest } from '../models/lifi-transaction-request';
import { LifiApiService } from '../services/lifi-api-service';

export class LifiSolanaCrossChainTrade extends SolanaCrossChainTrade {
    /** @internal */
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<SolanaBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    private readonly route: Route;

    private readonly providerGateway: string;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType: BridgeType;

    public readonly priceImpact: number | null;

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    private get fromBlockchain(): LifiCrossChainSupportedBlockchain {
        return this.from.blockchain as LifiCrossChainSupportedBlockchain;
    }

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
        crossChainTrade: LifiCrossChainTradeConstructor<SolanaBlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.providerGateway = this.route.steps[0]!.estimate.approvalAddress;

        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.priceImpact = crossChainTrade.priceImpact;
        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.bridgeType = crossChainTrade.bridgeType;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        let transactionHash: string;

        try {
            const { data } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options?.receiverAddress
            );

            const { onConfirm } = options;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

            await this.web3Private.sendTransaction({
                data,
                onTransactionHash,
                fromAddress: this.walletAddress
            });

            return transactionHash!;
        } catch (err) {
            if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
                throw new TooLowAmountError();
            }
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw parseError(err);
        }
    }

    public async getContractParams(
        _options: GetContractParamsOptions,
        _skipAmountChangeCheck: boolean = false
    ): Promise<ContractParams> {
        throw new Error('Solana contracts is not implemented yet');
    }

    protected async getTransactionConfigAndAmount(receiverAddress?: string): Promise<{
        config: { data: string };
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
}
