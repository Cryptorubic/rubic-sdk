import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BitcoinBlockchainName,
    BlockchainName,
    EvmBlockchainName,
    TonBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import { SymbiosisTradeType } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';

import { FeeInfo } from '../../common/models/fee-info';

export interface SymbiosisCrossChainTradeConstructor<Blockchain extends BlockchainName> {
    from: PriceTokenAmount<Blockchain>;
    to: PriceTokenAmount;
    gasData: GasData | null;
    priceImpact: number | null;
    slippage: number;
    feeInfo: FeeInfo;
    transitAmount: BigNumber;
    tradeType: { in?: SymbiosisTradeType; out?: SymbiosisTradeType };
    contractAddresses: { providerRouter: string; providerGateway: string };
    swapParams: SymbiosisSwappingParams;
    promotions?: string[];
}

export type SymbiosisEvmCrossChainTradeConstructor =
    SymbiosisCrossChainTradeConstructor<EvmBlockchainName>;

export type SymbiosisTonCrossChainTradeConstructor =
    SymbiosisCrossChainTradeConstructor<TonBlockchainName>;

export type SymbiosisTronCrossChainTradeConstructor =
    SymbiosisCrossChainTradeConstructor<TronBlockchainName>;

export type SymbiosisbitcoinCrossChainTradeConstructor =
    SymbiosisCrossChainTradeConstructor<BitcoinBlockchainName>;
