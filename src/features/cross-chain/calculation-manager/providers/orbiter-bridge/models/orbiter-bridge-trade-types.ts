import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { OrbiterTokenSymbols } from './orbiter-api-common-types';

export interface OrbiterGetGasDataParams {
    fromToken: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    feeInfo: FeeInfo;
    providerAddress: string;
    orbiterTokenSymbols: OrbiterTokenSymbols;
    orbiterFee: string;
    receiverAddress?: string;
}

export interface OrbiterTradeParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        orbiterTokenSymbols: OrbiterTokenSymbols;
        orbiterFee: string;
    };
    providerAddress: string;
    routePath: RubicStep[];
}
