import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

import {
    TaikoBridgeSupportedBlockchain,
    taikoBridgeSupportedBlockchains
} from './models/taiko-bridge-supported-blockchains';
import { TaikoBridgeTrade } from './taiko-bridge-trade';

export class TaikoBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.TAIKO_BRIDGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is TaikoBridgeSupportedBlockchain {
        return taikoBridgeSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as TaikoBridgeSupportedBlockchain;
        const toBlockchain = toToken.blockchain as TaikoBridgeSupportedBlockchain;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: fromToken.tokenAmount
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await TaikoBridgeTrade.getGasData(fromToken, to)
                    : null;

            return {
                trade: new TaikoBridgeTrade(
                    {
                        from: fromToken,
                        to,
                        gasData
                    },
                    options.providerAddress
                ),
                tradeType: this.type
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getFeeInfo(
        _fromBlockchain: CbridgeCrossChainSupportedBlockchain,
        _providerAddress: string,
        _percentFeeToken: PriceTokenAmount,
        _useProxy: boolean
    ): Promise<FeeInfo> {
        return {};
    }
}
