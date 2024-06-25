import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';

export interface EddyBridgeGetGasDataParams {
    from: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    feeInfo: FeeInfo;
    providerAddress: string;
}

export interface EddyBridgeTradeConstructorParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        feeInfo: FeeInfo;
        priceImpact: number | null;
    };
    providerAddress: string;
    routePath: RubicStep[];
}
