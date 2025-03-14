import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BlockchainName,
    EvmBlockchainName,
    TonBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';

export interface BridgersCrossChainParams<Blockchain extends BlockchainName> {
    crossChainTrade: {
        from: PriceTokenAmount<Blockchain>;
        to: PriceTokenAmount;
        toTokenAmountMin: BigNumber;
        feeInfo: FeeInfo;
        gasData: GasData;
        slippage: number;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
}

export type BridgersEvmCrossChainParams = BridgersCrossChainParams<EvmBlockchainName>;
export type BridgersTronCrossChainParams = BridgersCrossChainParams<TronBlockchainName>;
export type BridgersTonCrossChainParams = BridgersCrossChainParams<TonBlockchainName>;
