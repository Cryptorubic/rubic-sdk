import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';

export interface OwlToGetGasDataParams {
    fromToken: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    feeInfo: FeeInfo;
    providerAddress: string;
    gasLimit: BigNumber;
    makerAddress: string;
}

export interface OwlToTradeParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        makerAddress: string;
    };
    providerAddress: string;
    routePath: RubicStep[];
}
