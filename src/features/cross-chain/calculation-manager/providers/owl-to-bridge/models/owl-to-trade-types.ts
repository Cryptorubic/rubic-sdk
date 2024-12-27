import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { OwlTopSwapRequest } from './owl-to-api-types';

export interface OwlToGetGasDataParams {
    fromToken: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    feeInfo: FeeInfo;
    providerAddress: string;
    swapParams: OwlTopSwapRequest;
    approveAddress: string;
}

export interface OwlToTradeParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        swapParams: OwlTopSwapRequest;
        approveAddress: string;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}
