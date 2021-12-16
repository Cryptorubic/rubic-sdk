import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasData } from '@features/cross-chain/models/gas-data';
import { MinMaxAmountsErrors } from '@features/cross-chain/cross-chain-trade/models/MinMaxAmountsErrors';
import { TransactionOptions } from '@core/blockchain/models/transaction-options';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
export declare class CrossChainTrade {
    static getGasData(fromTrade: ContractTrade, toTrade: ContractTrade, cryptoFeeToken: PriceTokenAmount): Promise<GasData | null>;
    private readonly fromTrade;
    private readonly toTrade;
    readonly cryptoFeeToken: PriceTokenAmount;
    readonly transitFeeToken: PriceTokenAmount;
    private readonly minMaxAmountsErrors;
    private readonly gasData;
    private readonly web3Private;
    private readonly fromWeb3Public;
    private readonly toWeb3Public;
    private get walletAddress();
    get fromToken(): PriceTokenAmount;
    get toToken(): PriceTokenAmount;
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
    approve(tokenAddress: string, options: TransactionOptions): Promise<TransactionReceipt>;
    private checkWalletConnected;
    private checkBlockchainCorrect;
    private checkContractsState;
    private checkToBlockchainGasPrice;
    private checkToContractBalance;
    private checkUserBalance;
    private checkTradeErrors;
    private getContractMethodData;
    swap(options?: TransactionOptions): Promise<string | never>;
    private parseSwapErrors;
}
