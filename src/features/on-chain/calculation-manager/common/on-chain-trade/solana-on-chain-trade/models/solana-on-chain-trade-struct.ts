import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainProxyFeeInfo } from '../../../../models/on-chain-proxy-fee-info';
import { OnChainTradeStruct } from '../../evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface SolanaOnChainTradeStruct extends OnChainTradeStruct<SolanaBlockchainName> {
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<SolanaBlockchainName>;
    path: ReadonlyArray<Token>;
    apiQuote?: QuoteRequestInterface;
    apiResponse?: QuoteResponseInterface;
}
