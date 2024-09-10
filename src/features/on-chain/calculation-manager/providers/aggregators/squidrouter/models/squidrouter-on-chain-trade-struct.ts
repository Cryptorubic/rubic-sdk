import { SquidrouterTransactionRequest } from 'src/features/common/providers/squidrouter/models/transaction-request';

import { EvmOnChainTradeStruct } from '../../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface SquidRouterOnChainTradeStruct extends EvmOnChainTradeStruct {
    transactionRequest: SquidrouterTransactionRequest;
}
