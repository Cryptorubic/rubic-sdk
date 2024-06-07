import { NotSupportedBlockchain } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { NativeRouterTradeInstance } from '../common/native-router-abstract/models/native-router-trade-struct';
import { NativeRouterAbstractProvider } from '../common/native-router-abstract/native-router-abstract-provider';
import { zetaswapOnChainSupportedBlockchains } from './constants/zetaswap-supported-blockchains';
import { ZetaswapTrade } from './zetaswap-trade';
export class ZetaswapProvider extends NativeRouterAbstractProvider<ZetaswapTrade> {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.ZETA_SWAP;

    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return zetaswapOnChainSupportedBlockchains.some(chain => chain === blockchain);
    }

    protected createNativeRouterTradeInstance(
        tradeInstance: NativeRouterTradeInstance
    ): ZetaswapTrade {
        return new ZetaswapTrade(tradeInstance);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<ZetaswapTrade | OnChainTradeError> {
        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new NotSupportedBlockchain();
        }
        return super.calculate(from, toToken, options);
    }
}
