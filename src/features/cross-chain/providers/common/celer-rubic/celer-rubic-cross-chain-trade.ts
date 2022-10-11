import { PriceTokenAmount, Web3Public } from 'src/core';
import { CrossChainIsUnavailableError, MaxGasPriceOverflowError } from 'src/common';
import { Cache } from '@rsdk-common/decorators/cache.decorator';
import { CrossChainContractTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { Injector } from '@rsdk-core/sdk/injector';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { CrossChainTrade } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade';
import BigNumber from 'bignumber.js';

/**
 * Contains common for Celer and Rubic trades methods and fields.
 */
export abstract class CelerRubicCrossChainTrade extends CrossChainTrade {
    /**
     * Gets price impact in source and target blockchains, based on tokens usd prices.
     */
    @Cache
    public get priceImpactData(): {
        priceImpactFrom: number | null;
        priceImpactTo: number | null;
    } {
        const calculatePriceImpact = (trade: CrossChainContractTrade): number | null => {
            return trade.fromToken.calculatePriceImpactPercent(trade.toToken);
        };

        return {
            priceImpactFrom: calculatePriceImpact(this.fromTrade),
            priceImpactTo: calculatePriceImpact(this.toTrade)
        };
    }

    /**
     * Wrapped instant trade in source blockchain.
     */
    public abstract readonly fromTrade: CrossChainContractTrade;

    /**
     * Wrapped instant trade in target blockchain.
     */
    public abstract readonly toTrade: CrossChainContractTrade;

    /**
     * Native token in source blockchain, taken as fee.
     */
    public abstract readonly cryptoFeeToken: PriceTokenAmount;

    /**
     * Transit token in source blockchain, taken as fee.
     */
    public abstract readonly transitFeeToken: PriceTokenAmount;

    public abstract readonly feeInPercents: number;

    protected abstract readonly toWeb3Public: Web3Public;

    protected get fromContractAddress(): string {
        return this.fromTrade.contract.address;
    }

    protected constructor(protected readonly providerAddress: string) {
        super(providerAddress);
    }

    protected abstract checkTradeErrors(): Promise<void | never>;

    protected async checkContractsState(): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            this.fromTrade.contract.isPaused(),
            this.toTrade.contract.isPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    protected async checkToBlockchainGasPrice(): Promise<void | never> {
        if (this.toTrade.blockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
            return;
        }

        const [maxGasPrice, currentGasPrice] = await Promise.all([
            this.toTrade.contract.getMaxGasPrice(),
            Injector.gasPriceApi.getGasPriceInEthUnits(this.toTrade.blockchain)
        ]);
        if (maxGasPrice.lt(currentGasPrice)) {
            throw new MaxGasPriceOverflowError();
        }
    }

    protected async checkToContractBalance(): Promise<void | never> {
        return this.toWeb3Public.checkBalance(
            this.toTrade.fromToken,
            this.fromTrade.fromToken.tokenAmount,
            this.toTrade.contract.address
        );
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const cryptoFeeCost = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(cryptoFeeCost).dividedBy(this.to.tokenAmount);
    }
}
