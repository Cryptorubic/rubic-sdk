import BigNumber from 'bignumber.js';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Route } from 'src/features/cross-chain/calculation-manager/providers/lifi-provider/models/lifi-route';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface LifiTradeStruct<T extends BlockchainName> extends OnChainTradeStruct<T> {
    type: OnChainTradeType;
    route: Route;
    toTokenWeiAmountMin: BigNumber;
}
