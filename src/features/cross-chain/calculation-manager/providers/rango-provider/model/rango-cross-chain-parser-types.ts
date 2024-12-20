import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RangoSwapQueryParams } from 'src/features/common/providers/rango/models/rango-parser-types';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';

export interface RangoCrossChainTradeConstructorParams<T extends BlockchainName> {
    crossChainTrade: {
        from: PriceTokenAmount<T>;
        to: PriceTokenAmount<BlockchainName>;
        gasData: GasData | null;
        toTokenAmountMin: BigNumber;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        slippage: number;
        swapQueryParams: RangoSwapQueryParams;
        bridgeSubtype: BridgeType;
        memo?: string;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
}
