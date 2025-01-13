import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';

import { BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { Route } from './lifi-route';

export interface LifiCrossChainTradeConstructor<T extends BlockchainName> {
    from: PriceTokenAmount<T>;
    to: PriceTokenAmount<BlockchainName>;
    route: Route;
    toTokenAmountMin: BigNumber;
    feeInfo: FeeInfo;
    priceImpact: number | null;
    onChainSubtype: OnChainSubtype;
    bridgeType: BridgeType;
    slippage: number;
    gasData?: GasData | null;
    memo?: string;
}

export type LifiEvmCrossChainTradeConstructor = Required<
    Omit<LifiCrossChainTradeConstructor<EvmBlockchainName>, 'memo'>
>;
