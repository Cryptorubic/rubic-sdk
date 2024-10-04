import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { RubicStep } from '../common/models/rubicStep';
import { oneinchCcrSupportedChains } from './constants/oneinch-ccr-supported-chains';

export class OneinchCcrProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ONEINCH;

    public isSupportedBlockchain(fromBlockchain: BlockchainName): boolean {
        return oneinchCcrSupportedChains.some(chain => chain === fromBlockchain);
    }

    public calculate(
        _from: PriceTokenAmount<EvmBlockchainName>,
        _toToken: PriceToken<EvmBlockchainName>,
        _options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        throw new Error('Method not implemented.');
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
