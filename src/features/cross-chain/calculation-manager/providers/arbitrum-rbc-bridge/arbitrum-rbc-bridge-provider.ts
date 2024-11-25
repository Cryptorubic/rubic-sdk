import { getL2Network } from '@arbitrum/sdk';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ArbitrumRbcBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/arbitrum-rbc-bridge-trade';
import {
    ArbitrumRbcBridgeSupportedBlockchain,
    arbitrumRbcBridgeSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/constants/arbitrum-rbc-bridge-supported-blockchain';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

export class ArbitrumRbcBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ARBITRUM;

    private readonly l1TokenAddress = '0x3330BFb7332cA23cd071631837dC289B09C33333';

    private readonly l2TokenAddress = '0x10aaed289a7b1b0155bf4b86c862f297e84465e0';

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ArbitrumRbcBridgeSupportedBlockchain {
        return arbitrumRbcBridgeSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult<EvmEncodeConfig>> {
        const fromBlockchain = fromToken.blockchain as CbridgeCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as CbridgeCrossChainSupportedBlockchain;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        if (
            !(
                (compareAddresses(fromToken.address, this.l1TokenAddress) &&
                    compareAddresses(toToken.address, this.l2TokenAddress)) ||
                (compareAddresses(fromToken.address, this.l2TokenAddress) &&
                    compareAddresses(toToken.address, this.l1TokenAddress))
            )
        ) {
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

            const l2network = await getL2Network(42161);

            return {
                trade: new ArbitrumRbcBridgeTrade(
                    {
                        from: fromToken,
                        to,
                        gasData: await this.getGasData(fromToken),
                        l2network
                    },
                    options.providerAddress,
                    await this.getRoutePath(fromToken, to)
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
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
