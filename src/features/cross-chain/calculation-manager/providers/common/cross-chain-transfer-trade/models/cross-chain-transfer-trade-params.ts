import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { GasData } from '../../evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../models/fee-info';
import { RubicStep } from '../../models/rubicStep';

export interface CrossChainTransferTradeParams {
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
    onChainTrade: EvmOnChainTrade | null;
    from: PriceTokenAmount<BlockchainName>;
    to: PriceTokenAmount<BlockchainName>;
    toTokenAmountMin: BigNumber;
    gasData: GasData | null;
    feeInfo: FeeInfo;
    priceImpact: number | null;
}
