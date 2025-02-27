import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/models/on-chain-proxy-fee-info';

export interface OnChainTradeStruct<T extends BlockchainName> {
    from: PriceTokenAmount<T>;
    to: PriceTokenAmount<T>;

    slippageTolerance: number;

    gasFeeInfo: GasFeeInfo | null;

    useProxy: boolean;

    withDeflation: {
        from: IsDeflationToken;
        to: IsDeflationToken;
    };

    usedForCrossChain?: boolean;
}

export interface EvmOnChainTradeStruct extends OnChainTradeStruct<EvmBlockchainName> {
    permit2ApproveAddress?: string;
    proxyFeeInfo?: OnChainProxyFeeInfo;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
    path: RubicStep[];
    apiQuote: QuoteRequestInterface | null;
    apiResponse: QuoteResponseInterface | null;
}
