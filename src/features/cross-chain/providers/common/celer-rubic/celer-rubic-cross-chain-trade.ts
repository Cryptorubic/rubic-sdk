import { PriceTokenAmount, Web3Public } from 'src/core';
import BigNumber from 'bignumber.js';
import { Cache, CrossChainIsUnavailableError, MaxGasPriceOverflowError } from 'src/common';
import { CrossChainContractTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { Injector } from '@rsdk-core/sdk/injector';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { CrossChainTrade } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade';

export abstract class CelerRubicCrossChainTrade extends CrossChainTrade {
    public abstract readonly toTokenAmountMin: BigNumber;

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

    protected abstract readonly fromTrade: CrossChainContractTrade;

    protected abstract readonly toTrade: CrossChainContractTrade;

    protected abstract readonly cryptoFeeToken: PriceTokenAmount;

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
}
