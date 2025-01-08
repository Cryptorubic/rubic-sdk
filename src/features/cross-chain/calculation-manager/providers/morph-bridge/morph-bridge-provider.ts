import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { morphL1Erc20GatewayAbi } from 'src/features/cross-chain/calculation-manager/providers/morph-bridge/constants/morph-l1-erc20-gateway-abi';
import { morphL2Erc20GatewayAbi } from 'src/features/cross-chain/calculation-manager/providers/morph-bridge/constants/morph-l2-erc20-gateway-abi';
import {
    MorphBridgeSupportedBlockchain,
    morphBridgeSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/morph-bridge/models/morph-bridge-supported-blockchain';
import { MorphBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/morph-bridge/morph-bridge-trade';

import { morphBridgeContractAddress } from './constants/morph-bridge-contract-address';

export class MorphBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.MORPH_BRIDGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is MorphBridgeSupportedBlockchain {
        return morphBridgeSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as MorphBridgeSupportedBlockchain;
        const toBlockchain = toToken.blockchain as MorphBridgeSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

            if (!fromToken.isNative) {
                if (fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
                    const l2Address = await web3Public.callContractMethod(
                        morphBridgeContractAddress[fromBlockchain],
                        morphL1Erc20GatewayAbi,
                        'getL2ERC20Address',
                        [fromToken.address]
                    );
                    if (!compareAddresses(toToken.address, l2Address)) {
                        throw new RubicSdkError('Swap is not allowed.');
                    }
                } else {
                    const l1Address = await web3Public.callContractMethod(
                        morphBridgeContractAddress[fromBlockchain],
                        morphL2Erc20GatewayAbi,
                        'getL1ERC20Address',
                        [fromToken.address]
                    );
                    if (!compareAddresses(toToken.address, l1Address)) {
                        throw new RubicSdkError('Swap is not allowed.');
                    }
                }
            } else {
                if (!toToken.isNative) {
                    throw new RubicSdkError('Swap is not allowed.');
                }
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: fromToken.tokenAmount
            });

            return {
                trade: new MorphBridgeTrade(
                    {
                        from: fromToken,
                        to,
                        gasData: await this.getGasData(fromToken)
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
        fromBlockchain: ArchonBridgeSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
