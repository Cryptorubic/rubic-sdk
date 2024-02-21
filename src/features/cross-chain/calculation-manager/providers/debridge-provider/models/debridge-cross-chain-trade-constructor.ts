import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BlockchainName,
    EvmBlockchainName,
    SolanaBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export interface DebridgeCrossChainTradeConstructor<T extends BlockchainName> {
    from: PriceTokenAmount<T>;
    to: PriceTokenAmount<BlockchainName>;
    priceImpact: number | null;
    slippage: number;
    feeInfo: FeeInfo;
    transitAmount: BigNumber;
    toTokenAmountMin: BigNumber;
    cryptoFeeToken: PriceTokenAmount;

    transactionRequest?: TransactionRequest;
    gasData?: GasData | null;
    allowanceTarget?: string;
    onChainTrade?: EvmOnChainTrade | null;
}

export type DebridgeEvmCrossChainTradeConstructor = Required<
    DebridgeCrossChainTradeConstructor<EvmBlockchainName>
>;

export interface DebridgeSolanaCrossChainTradeConstructor
    extends DebridgeCrossChainTradeConstructor<SolanaBlockchainName> {
    transactionRequest: TransactionRequest;
}
