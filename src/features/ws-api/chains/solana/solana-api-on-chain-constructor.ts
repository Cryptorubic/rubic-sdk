import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    SolanaBlockchainName
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { SolanaOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/solana-on-chain-trade/models/solana-on-chain-trade-struct';

export interface SolanaApiOnChainConstructor {
    from: PriceTokenAmount<SolanaBlockchainName>;
    to: PriceTokenAmount<SolanaBlockchainName>;
    feeInfo: FeeInfo;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
    tradeStruct: SolanaOnChainTradeStruct;
}
