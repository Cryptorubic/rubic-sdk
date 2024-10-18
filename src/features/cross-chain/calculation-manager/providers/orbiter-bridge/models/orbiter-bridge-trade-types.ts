import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { OrbiterQuoteConfig } from './orbiter-api-quote-types';

export interface OrbiterGetGasDataParams {
    fromToken: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    feeInfo: FeeInfo;
    providerAddress: string;
    quoteConfig: OrbiterQuoteConfig;
    receiverAddress?: string;
}

export interface OrbiterTradeParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        quoteConfig: OrbiterQuoteConfig;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
}
