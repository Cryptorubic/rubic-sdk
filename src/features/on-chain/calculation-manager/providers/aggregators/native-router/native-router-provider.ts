import { NotSupportedBlockchain } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { NativeRouterTradeInstance } from '../common/native-router-abstract/models/native-router-trade-struct';
import { NativeRouterAbstractProvider } from '../common/native-router-abstract/native-router-abstract-provider';
import { nativeRouterSupportedBlockchains } from './constants/native-router-supported-blockchains';

export class NativeRouterProvider extends NativeRouterAbstractProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.NATIVE_ROUTER;

    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return nativeRouterSupportedBlockchains.some(chain => chain === blockchain);
    }

    protected createNativeRouterTradeInstance(
        tradeInstance: NativeRouterTradeInstance
    ): OnChainTrade {
        return new NativeRouterTrade(tradeInstance);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new NotSupportedBlockchain();
        }
        return super.calculate(from, toToken, options);
    }
}
