import { EvmBlockchainName } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface EvmApiOnChainConstructor {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    feeInfo: FeeInfo;
    tradeStruct: EvmOnChainTradeStruct;
}
