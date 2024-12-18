import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TronCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-cross-chain-supported-blockchains';
import { SymbiosisTronCrossChainTradeConstructor } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-cross-chain-trade-constructor';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import { TronTx } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { SymbiosisUtils } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-utils';

/**
 * Calculated Symbiosis cross-chain trade.
 */
export class SymbiosisTronCcrTrade extends TronCrossChainTrade {
    private readonly swappingParams: SymbiosisSwappingParams;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.SYMBIOSIS;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

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

    private readonly contractAddresses: { providerRouter: string; providerGateway: string };

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.contractAddresses.providerGateway;
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    constructor(
        crossChainTrade: SymbiosisTronCrossChainTradeConstructor,
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
        this.contractAddresses = crossChainTrade.contractAddresses;
        this.promotions = crossChainTrade?.promotions || [];
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
    ): Promise<{ config: TronTransactionConfig; amount: string }> {
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
        const tx = tradeData.tx as TronTx;

        const amount = tradeData.tokenAmountOut.amount;
        const config: TronTransactionConfig = {
            signature: tx.functionSelector,
            arguments: [],
            to: tx.to,
            rawParameter: tx.data,
            callValue: tx.value,
            feeLimit: tx.feeLimit
        };

        return { amount, config };
    }
}
