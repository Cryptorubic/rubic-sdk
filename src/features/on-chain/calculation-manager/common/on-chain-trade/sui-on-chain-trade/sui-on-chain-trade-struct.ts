import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    SuiBlockchainName
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { OnChainTradeStruct } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/models/on-chain-proxy-fee-info';

export interface SuiOnChainTradeStruct extends OnChainTradeStruct<SuiBlockchainName> {
    proxyFeeInfo?: OnChainProxyFeeInfo;
    fromWithoutFee: PriceTokenAmount<SuiBlockchainName>;
    path: RubicStep[];
    apiQuote?: QuoteRequestInterface;
    apiResponse?: QuoteResponseInterface;
}
