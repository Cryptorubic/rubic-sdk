import { CrossChainContractTrade } from 'src/features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { Injector } from 'src/core/injector/injector';
import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    CrossChainIsUnavailableError,
    InsufficientFundsError,
    MaxGasPriceOverflowError
} from 'src/common/errors';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Cache } from 'src/common/utils/decorators';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import BigNumber from 'bignumber.js';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

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

    protected abstract readonly toWeb3Public: EvmWeb3Public;

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
        const balance = await this.toWeb3Public.getBalance(
            this.toTrade.contract.address,
            this.toTrade.fromToken.address
        );
        if (balance.lt(this.toTrade.fromToken.weiAmount)) {
            throw new InsufficientFundsError(
                this.toTrade.fromToken,
                Web3Pure.fromWei(balance, this.toTrade.fromToken.decimals),
                this.toTrade.fromToken.tokenAmount
            );
        }
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const cryptoFeeCost = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(cryptoFeeCost).dividedBy(this.to.tokenAmount);
    }
}
