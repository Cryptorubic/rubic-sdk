import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { CalculationResult } from '../common/models/calculation-result';
import { OWL_TO_SUPPORTED_BLOCKCHAINS } from './constants/owl-to-supported-chains';

export class OwlToBridgeProvider extends CrossChainProvider {
    public type: CrossChainTradeType = BRIDGE_TYPE.OWL_TO_BRIDGE;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return OWL_TO_SUPPORTED_BLOCKCHAINS.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        return { trade: null };
    }
}
