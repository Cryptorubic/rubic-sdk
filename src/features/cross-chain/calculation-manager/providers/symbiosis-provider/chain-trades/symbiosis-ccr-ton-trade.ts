import { SendTransactionRequest } from '@tonconnect/sdk';
import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TonCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/ton-cross-chain-trade/ton-cross-chain-trade';
import { SymbiosisTonCrossChainTradeConstructor } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-cross-chain-trade-constructor';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import { SymbiosisUtils } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-utils';

/**
 * Calculated Symbiosis cross-chain trade.
 */
export class SymbiosisCcrTonTrade extends TonCrossChainTrade {
    private readonly swappingParams: SymbiosisSwappingParams;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.SYMBIOSIS;

    public readonly from: PriceTokenAmount<TonBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly feeInfo: FeeInfo;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        throw new Error('Not implemented');
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    constructor(
        crossChainTrade: SymbiosisTonCrossChainTradeConstructor,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.swappingParams = crossChainTrade.swapParams;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.transitAmount = crossChainTrade.transitAmount;
        this.onChainSubtype = SymbiosisUtils.getSubtype(
            crossChainTrade.tradeType,
            crossChainTrade.to.blockchain
        );
        this.promotions = crossChainTrade?.promotions || [];
    }

    protected async getContractParams(_options: GetContractParamsOptions): Promise<ContractParams> {
        throw new Error('Not implemented');
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: TonEncodedConfig; amount: string }> {
        const walletAddress = this.walletAddress;

        const params: SymbiosisSwappingParams = {
            ...this.swappingParams,
            from: walletAddress,
            to: receiverAddress || walletAddress,
            revertableAddress: SymbiosisUtils.getRevertableAddress(
                receiverAddress,
                walletAddress,
                this.to.blockchain
            )
        };

        const tradeData = await SymbiosisApiService.getCrossChainSwapTx(params);
        const tx = tradeData.tx as SendTransactionRequest;
        const swapMessage = tx.messages[0];
        if (!swapMessage || tx.messages.length > 1) {
            throw new Error('Wrong config');
        }

        const config = {
            payload: swapMessage.payload,
            amount: swapMessage.amount,
            address: swapMessage.address
        };

        return { config, amount: tradeData.tokenAmountOut.amount };
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        await this.checkReceiverAddress(options.receiverAddress, true);

        const config = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress || this.walletAddress
        );

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private.sendTransaction({ messages: [config], onTransactionHash });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }
}
