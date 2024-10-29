import { PriceTokenAmount } from 'src/common/tokens';
import {
    BlockchainName,
    EvmBlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RetroBridgeQuoteSendParams } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/models/retro-bridge-quote-send-params';

export interface RetroBridgeConstructorParams<T extends BlockchainName> {
    from: PriceTokenAmount<T>;
    to: PriceTokenAmount<BlockchainName>;
    feeInfo: FeeInfo;
    priceImpact: number | null;
    slippage: number;
    gasData: GasData | null;
    quoteSendParams: RetroBridgeQuoteSendParams;
    hotWalletAddress: string;
    isSimulation?: boolean;
}

export type RetroBridgeEvmConstructorParams = Required<
    RetroBridgeConstructorParams<EvmBlockchainName>
>;

export type RetroBridgeTonConstructorParams = Required<
    RetroBridgeConstructorParams<TonBlockchainName>
>;
