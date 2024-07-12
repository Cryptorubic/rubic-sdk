import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { OnChainTradeStruct } from '../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';

export class TonkeeperOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.TONKEEPER;
    public calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        throw new Error('Method not implemented.');
    }
    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        throw new Error('Method not implemented.');
    }
    protected getGasFeeInfo(
        tradeStruct: OnChainTradeStruct<BlockchainName>,
        providerGateway?: string
    ): Promise<GasFeeInfo | null> {
        throw new Error('Method not implemented.');
    }
}
