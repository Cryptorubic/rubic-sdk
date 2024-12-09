import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ArchonBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/archon-bridge-trade';
import { ArchonContractService } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/archon-contract-service';
import {
    ArchonBridgeSupportedBlockchain,
    archonBridgeSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';
import {
    eonAvalancheTokensMapping,
    eonEthTokensMapping,
    supportedEonTokens
} from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/supported-tokens';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';

export class ArchonBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ARCHON_BRIDGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ArchonBridgeSupportedBlockchain {
        return archonBridgeSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            this.isSupportedBlockchain(fromBlockchain) &&
            this.isSupportedBlockchain(toBlockchain) &&
            (fromBlockchain === BLOCKCHAIN_NAME.HORIZEN_EON ||
                toBlockchain === BLOCKCHAIN_NAME.HORIZEN_EON)
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as ArchonBridgeSupportedBlockchain;
        const toBlockchain = toToken.blockchain as ArchonBridgeSupportedBlockchain;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        if (this.checkUnsupportedTokens(fromToken, toToken)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const useProxy = options?.useProxy?.[this.type] ?? true;
            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                fromToken,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                fromToken,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const nativeToken = await PriceToken.createFromToken(
                nativeTokensList[fromToken.blockchain]
            );
            const cryptoFee = await ArchonContractService.fetchLayerZeroFee(fromToken, toToken);
            feeInfo.provider = {
                cryptoFee: {
                    amount: Web3Pure.fromWei(cryptoFee, nativeToken.decimals),
                    token: nativeToken
                }
            };

            const providerFeePercent = await ArchonContractService.fetchDepositFeeBps(
                fromToken,
                toToken
            );
            const toAmount = fromWithoutFee.tokenAmount.multipliedBy(1 - providerFeePercent);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });

            return {
                trade: new ArchonBridgeTrade(
                    {
                        from: fromToken,
                        to,
                        gasData: await this.getGasData(fromToken),
                        feeInfo
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

    private checkUnsupportedTokens(fromToken: PriceTokenAmount, toToken: PriceToken): boolean {
        const fromBlockchain = fromToken.blockchain as ArchonBridgeSupportedBlockchain;
        const toBlockchain = toToken.blockchain as ArchonBridgeSupportedBlockchain;

        const [eonToken, nonEonBlockchain, nonEonToken] =
            fromBlockchain === BLOCKCHAIN_NAME.HORIZEN_EON
                ? [fromToken, toBlockchain, toToken]
                : [toToken, fromBlockchain, fromToken];

        const eonTokenAddress = Object.values(supportedEonTokens).find(el =>
            compareAddresses(el, eonToken.address)
        );
        if (!eonTokenAddress) {
            return true;
        }
        const fromNetworkAddresses =
            nonEonBlockchain === BLOCKCHAIN_NAME.ETHEREUM
                ? eonEthTokensMapping
                : eonAvalancheTokensMapping;
        const nonEonAddresses = fromNetworkAddresses[eonTokenAddress];
        const allowSwap = nonEonAddresses.some(address =>
            compareAddresses(address, nonEonToken.address)
        );

        return !allowSwap;
    }
}
