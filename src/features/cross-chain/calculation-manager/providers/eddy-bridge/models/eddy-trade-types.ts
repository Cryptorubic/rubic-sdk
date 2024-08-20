import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { EddyRoutingDirection } from '../utils/eddy-bridge-routing-directions';

export interface EddyBridgeGetGasDataParams {
    from: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    feeInfo: FeeInfo;
    providerAddress: string;
    slippage: number;
    routingDirection: EddyRoutingDirection;
}

export interface EddyBridgeTradeConstructorParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        slippage: number;
        prevGasFeeInDestTokenUnits: BigNumber | undefined;
        routingDirection: EddyRoutingDirection;
        ratioToAmount: number;
    };
    providerAddress: string;
    routePath: RubicStep[];
}
