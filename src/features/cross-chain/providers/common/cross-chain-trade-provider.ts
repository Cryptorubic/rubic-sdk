import { CrossChainTradeType } from 'src/features';
import { RequiredCrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { WrappedCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { RubicSdkError } from 'src/common';
import { parseError } from '@common/utils/errors';

export abstract class CrossChainTradeProvider {
    public abstract readonly type: CrossChainTradeType;

    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null>;

    protected parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate cross chain trade');
    }
}
