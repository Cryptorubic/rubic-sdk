import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BlockchainName,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';

export interface MesonCrossChainTradeConstructorParams<Blockchain extends BlockchainName> {
    crossChainTrade: {
        from: PriceTokenAmount<Blockchain>;
        to: PriceTokenAmount<BlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        sourceAssetString: string;
        targetAssetString: string;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}

export interface MesonGetGasDataParams<Blockchain extends BlockchainName> {
    from: PriceTokenAmount<Blockchain>;
    toToken: PriceTokenAmount;
    feeInfo: FeeInfo;
    providerAddress: string;
    sourceAssetString: string;
    targetAssetString: string;
}

export type MesonCrossChainEvmTradeConstructorParams =
    MesonCrossChainTradeConstructorParams<EvmBlockchainName>;
export type MesonCrossChainTronTradeConstructorParams =
    MesonCrossChainTradeConstructorParams<TronBlockchainName>;
