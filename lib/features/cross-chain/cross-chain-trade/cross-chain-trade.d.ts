import { ContractTrade } from '../contract-trade/contract-trade';
import { PriceTokenAmount } from '../../../core/blockchain/tokens/price-token-amount';
import { GasData } from '../models/gas-data';
import { MinMaxAmountsErrors } from './models/min-max-amounts-errors';
import { SwapTransactionOptions } from '../../swap/models/swap-transaction-options';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { BasicTransactionOptions } from '../../../core';
export declare class CrossChainTrade {
    static getGasData(fromTrade: ContractTrade, toTrade: ContractTrade, cryptoFeeToken: PriceTokenAmount): Promise<GasData | null>;
    private readonly fromTrade;
    private readonly toTrade;
    readonly cryptoFeeToken: PriceTokenAmount;
    readonly transitFeeToken: PriceTokenAmount;
    private readonly minMaxAmountsErrors;
    private readonly gasData;
    private readonly fromWeb3Public;
    private readonly toWeb3Public;
    readonly from: PriceTokenAmount;
    readonly to: PriceTokenAmount;
    readonly toTokenAmountMin: BigNumber;
    private get walletAddress();
    get estimatedGas(): BigNumber | null;
    get priceImpactData(): {
        priceImpactFrom: number | null;
        priceImpactTo: number | null;
    };
    constructor(crossChainTrade: {
        fromTrade: ContractTrade;
        toTrade: ContractTrade;
        cryptoFeeToken: PriceTokenAmount;
        transitFeeToken: PriceTokenAmount;
        minMaxAmountsErrors: MinMaxAmountsErrors;
        gasData: GasData | null;
    });
    needApprove(): Promise<boolean>;
    approve(options: BasicTransactionOptions): Promise<TransactionReceipt>;
    protected checkAllowanceAndApprove(options?: Omit<SwapTransactionOptions, 'onConfirm'>): Promise<void>;
    private checkWalletConnected;
    private checkBlockchainCorrect;
    private checkContractsState;
    private checkToBlockchainGasPrice;
    private checkToContractBalance;
    private checkUserBalance;
    private checkTradeErrors;
    private getContractParams;
    swap(options?: SwapTransactionOptions): Promise<string | never>;
    private parseSwapErrors;
}
