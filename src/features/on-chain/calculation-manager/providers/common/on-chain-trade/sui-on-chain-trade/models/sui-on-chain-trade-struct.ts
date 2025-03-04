import { PriceTokenAmount, Token } from 'src/common/tokens';
import { SuiBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeStruct } from '../../evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface SuiOnChainTradeStruct extends OnChainTradeStruct<SuiBlockchainName> {
    fromWithoutFee: PriceTokenAmount<SuiBlockchainName>;
    path: ReadonlyArray<Token>;
}
