import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { LayerZeroBridgeTrade } from './layerzero-bridge-trade';
import {
    LayerZeroBridgeSupportedBlockchain,
    layerZeroBridgeSupportedBlockchains
} from './models/layerzero-bridge-supported-blockchains';
import { estimateSendFeeLZ } from './utils/estimate-fee';

export class LayerZeroBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LAYERZERO;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is LayerZeroBridgeSupportedBlockchain {
        return layerZeroBridgeSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private assertSupportedToken(
        token: PriceToken
    ): asserts token is PriceTokenAmount<LayerZeroBridgeSupportedBlockchain> {
        if (!this.isSupportedBlockchain(token.blockchain)) {
            throw new NotSupportedTokensError();
        }
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        try {
            this.assertSupportedToken(fromToken);
            this.assertSupportedToken(toToken);

            const useProxy = options?.useProxy?.[this.type] ?? true;
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: fromToken.tokenAmount
            });
            const gas = await estimateSendFeeLZ(fromToken, to, options.receiverAddress).catch(
                () => null
            );

            return {
                trade: new LayerZeroBridgeTrade(
                    {
                        from: fromToken,
                        to,
                        gasData: await this.getGasData(fromToken, {
                            totalGas: gas ?? '0'
                        })
                    },
                    options.providerAddress,
                    await this.getRoutePath(fromToken, to),
                    useProxy
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

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
