import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';
import { TonWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/ton-web3-public/ton-web3-public';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TransactionConfig } from 'web3-core';

import { GasFeeInfo } from '../evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade';
import { TonOnChainTradeStruct } from './models/ton-on-chian-trade-types';

export abstract class TonOnChainTrade<T = undefined> extends OnChainTrade {
    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly slippageTolerance: number;

    public readonly feeInfo: FeeInfo = {};

    public readonly gasFeeInfo: GasFeeInfo | null;

    public readonly path = [];

    public readonly routingPath: RubicStep[];

    protected skipAmountCheck: boolean = false;

    public get isMultistepSwap(): boolean {
        return this.routingPath.length > 1;
    }

    protected get spenderAddress(): string {
        throw new RubicSdkError('No spender address!');
    }

    protected get web3Public(): TonWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TON);
    }

    protected get web3Private(): TonWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(BLOCKCHAIN_NAME.TON);
    }

    constructor(tradeStruct: TonOnChainTradeStruct, providerAddress: string) {
        super(providerAddress);
        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.gasFeeInfo = tradeStruct.gasFeeInfo;
        this.routingPath = tradeStruct.routingPath;
    }

    public override async needApprove(): Promise<boolean> {
        return false;
    }

    public async approve(): Promise<void> {
        throw new RubicSdkError('Method not implemented!');
    }

    public async encodeApprove(): Promise<TransactionConfig> {
        throw new Error('Method is not supported');
    }

    public async encode(): Promise<T> {
        throw new RubicSdkError(
            'Method not implemented! Use custom swap methods on each child class!'
        );
    }

    protected async makePreSwapChecks(options: EncodeTransactionOptions): Promise<void> {
        checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);
        await this.checkFromAddress(options.fromAddress);
        await this.checkReceiverAddress(options.receiverAddress);

        if (!options.skipAmountCheck) {
            this.skipAmountCheck = true;
            const toWeiAmount = await this.calculateOutputAmount(options);
            this.checkAmountChange(toWeiAmount, this.to.stringWeiAmount);
        }
    }

    /**
     * recalculates and returns output stringWeiAmount
     */
    protected abstract calculateOutputAmount(options: EncodeTransactionOptions): Promise<string>;

    public override getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippageTolerance * 100,
            routePath: this.routingPath
        };
    }
}
