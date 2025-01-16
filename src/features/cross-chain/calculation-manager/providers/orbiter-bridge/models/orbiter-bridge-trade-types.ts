import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BlockchainName,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { OrbiterQuoteConfig } from './orbiter-api-quote-types';

export interface OrbiterGetGasDataParams<Blockchain extends BlockchainName> {
    fromToken: PriceTokenAmount<Blockchain>;
    toToken: PriceTokenAmount;
    feeInfo: FeeInfo;
    providerAddress: string;
    quoteConfig: OrbiterQuoteConfig;
    receiverAddress?: string;
}

export interface OrbiterTradeParams<Blockchain extends BlockchainName> {
    crossChainTrade: {
        from: PriceTokenAmount<Blockchain>;
        to: PriceTokenAmount;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        quoteConfig: OrbiterQuoteConfig;
        toTokenAmountMin: BigNumber;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
}

export type OrbiterEvmTradeParams = OrbiterTradeParams<EvmBlockchainName>;
export type OrbiterTronTradeParams = OrbiterTradeParams<TronBlockchainName>;
