import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { DEDUST_GAS } from '../dedust/constants/dedust-gas';

export class StonfiOnChainProvider extends AggregatorOnChainProvider {
    public tradeType = ON_CHAIN_TRADE_TYPE.STONFI;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        _from: PriceTokenAmount<TonBlockchainName>,
        _toToken: PriceToken<TonBlockchainName>,
        _options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        throw new Error('Method not implemented.');
    }

    protected async getGasFeeInfo(): Promise<GasFeeInfo | null> {
        return {
            gasPrice: new BigNumber(1),
            gasLimit: new BigNumber(DEDUST_GAS)
        };
    }
}
