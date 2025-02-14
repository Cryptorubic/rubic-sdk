import { TeleswapSDK } from '@teleportdao/teleswap-sdk';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BitcoinBlockchainName,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';

export interface TeleSwapConstructorParams<T extends BlockchainName> {
    crossChainTrade: {
        from: PriceTokenAmount<T>;
        to: PriceTokenAmount<BlockchainName>;
        feeInfo: FeeInfo;
        gasData: GasData | null;
        priceImpact: number | null;
        teleSwapSdk: TeleswapSDK;
        slippage: number;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
}

export interface TeleSwapEvmConstructorParams
    extends TeleSwapConstructorParams<EvmBlockchainName> {}
export interface TeleSwapBitcoinConstructorParams
    extends TeleSwapConstructorParams<BitcoinBlockchainName> {}
