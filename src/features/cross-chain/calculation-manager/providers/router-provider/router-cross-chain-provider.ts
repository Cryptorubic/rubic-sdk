import { NotSupportedTokensError } from "src/common/errors";
import { PriceTokenAmount, PriceToken } from "src/common/tokens";
import { BlockchainName } from "src/core/blockchain/models/blockchain-name";
import { blockchainId } from "src/core/blockchain/utils/blockchains-info/constants/blockchain-id";
import { EvmEncodeConfig } from "src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config";
import { TronTransactionConfig } from "src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config";
import { Web3Pure } from "src/core/blockchain/web3-pure/web3-pure";
import { RouterApiService } from "src/features/common/providers/router/services/router-api-service";
import { getFromWithoutFee } from "src/features/common/utils/get-from-without-fee";
import { CrossChainOptions, RequiredCrossChainOptions } from "../../models/cross-chain-options";
import { CROSS_CHAIN_TRADE_TYPE } from "../../models/cross-chain-trade-type";
import { CrossChainProvider } from "../common/cross-chain-provider";
import { CalculationResult } from "../common/models/calculation-result";
import { FeeInfo } from "../common/models/fee-info";
import { ProxyCrossChainEvmTrade } from "../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade";
import { RouterCrossChainSupportedBlockchains, routerCrossChainSupportedChains } from "./constants/router-cross-chain-supported-chains";
import { RouterCrossChainTrade } from "./router-cross-chain-trade";

export class RouterCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public isSupportedBlockchain(
        fromBlockchain: BlockchainName
    ): boolean {
        return routerCrossChainSupportedChains.some(
            chain => chain === fromBlockchain
        )
    }

    public async calculate(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        if (!this.areSupportedBlockchains(from.blockchain, toToken.blockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            }
        }

        const useProxy = options?.useProxy?.[this.type] ?? true;
        const fromBlockchain = from.blockchain as RouterCrossChainSupportedBlockchains;

        try {
            const srcChainId = blockchainId[from.blockchain];
            const dstChainId = blockchainId[toToken.blockchain];
            const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
            const srcTokenAddress = from.isNative ? NATIVE_TOKEN_ADDRESS : from.address;
            const dstTokenAddress = toToken.isNative ? NATIVE_TOKEN_ADDRESS : toToken.address;
            const feeInfo = this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo?.rubicProxy?.platformFee?.percent
            );

            const routerQuoteConfig = await RouterApiService.getQuote({
                amount: fromWithoutFee.stringWeiAmount,
                fromTokenAddress: srcTokenAddress,
                fromTokenChainId: srcChainId,
                toTokenAddress: dstTokenAddress,
                toTokenChainId: dstChainId,
                slippageTolerance: options.slippageTolerance * 100
            });
            const dstTokenAmount = routerQuoteConfig.destination.tokenAmount;
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(
                    dstTokenAmount,
                    routerQuoteConfig.destination.asset.decimals
                )
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? RouterCrossChainTrade.getGasData(
                        from,
                        to,
                        feeInfo,
                        options.providerAddress,
                        options?.receiverAddress
                    ) : null;
            return {
                trade: new RouterCrossChainTrade({
                    from,
                    to,
                    feeInfo,
                    gasData,
                    priceImpact: from.calculatePriceImpactPercent(to),
                },
                    options.providerAddress,
                    []
                ),
                tradeType: this.type
            }
        } catch (err) {
            return {
                trade: null,
                error: err,
                tradeType: this.type
            }
        }
    }


    private async getFeeInfo(
        fromBlockchain: RouterCrossChainSupportedBlockchains,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        )
    }
}
