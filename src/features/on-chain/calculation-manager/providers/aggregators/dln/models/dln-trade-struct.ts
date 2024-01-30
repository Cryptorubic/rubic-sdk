import BigNumber from 'bignumber.js';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { DlnOnChainSupportedBlockchain } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface DlnTradeStruct<T extends DlnOnChainSupportedBlockchain>
    extends OnChainTradeStruct<T> {
    type: OnChainTradeType;
    // route: Route;
    toTokenWeiAmountMin: BigNumber;
    providerGateway: string;
    transactionRequest: TransactionRequest;
}
