import { BasicTransactionOptions } from '@core/blockchain/models/basic-transaction-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { EncodeTransactionOptions } from '@features/swap/models/encode-transaction-options';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { OptionsGasParams, TransactionGasParams } from '@features/swap/models/gas-params';
export declare abstract class InstantTrade {
    static getContractAddress(): string;
    static getTradeType(): string;
    abstract readonly from: PriceTokenAmount;
    abstract readonly to: PriceTokenAmount;
    abstract readonly gasFeeInfo: GasFeeInfo | null;
    abstract readonly slippageTolerance: number;
    protected abstract contractAddress: string;
    protected readonly web3Private: import("../../core/blockchain/web3-private/web3-private").Web3Private;
    protected readonly web3Public: Web3Public;
    protected get walletAddress(): string;
    get toTokenAmountMin(): PriceTokenAmount;
    protected constructor(blockchain: BLOCKCHAIN_NAME);
    needApprove(): Promise<boolean>;
    approve(options: BasicTransactionOptions): Promise<TransactionReceipt>;
    abstract swap(options: SwapTransactionOptions): Promise<TransactionReceipt>;
    abstract encode(options: EncodeTransactionOptions): Promise<TransactionConfig>;
    protected checkWalletState(): Promise<void>;
    protected checkWalletConnected(): never | void;
    private checkBlockchainCorrect;
    protected getGasLimit(options?: {
        gasLimit?: string | null;
    }): string | undefined;
    protected getGasPrice(options?: {
        gasPrice?: string | null;
    }): string | undefined;
    protected getGasParams(options: OptionsGasParams): TransactionGasParams;
}
