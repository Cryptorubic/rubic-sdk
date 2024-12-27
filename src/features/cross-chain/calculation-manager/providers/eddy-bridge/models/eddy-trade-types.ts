import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
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
    quoteOptions: RequiredCrossChainOptions;
}

export interface EddyBridgeTradeConstructorParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        slippage: number;
        routingDirection: EddyRoutingDirection;
        quoteOptions: RequiredCrossChainOptions;
        // ratioToAmount: number;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}
