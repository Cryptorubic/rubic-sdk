import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BitcoinBlockchainName,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { RouterQuoteResponseConfig } from 'src/features/common/providers/router/models/router-quote-response-config';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

export interface RouterConstructorParams<T extends BlockchainName> {
    crossChainTrade: {
        from: PriceTokenAmount<T>;
        to: PriceTokenAmount<BlockchainName>;
        feeInfo: FeeInfo;
        gasData: GasData | null;
        priceImpact: number | null;
        routerQuoteConfig: RouterQuoteResponseConfig;
        slippage: number;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}

export interface RouterEvmConstructorParams extends RouterConstructorParams<EvmBlockchainName> {}
export interface RouterBitcoinConstructorParams
    extends RouterConstructorParams<BitcoinBlockchainName> {}
