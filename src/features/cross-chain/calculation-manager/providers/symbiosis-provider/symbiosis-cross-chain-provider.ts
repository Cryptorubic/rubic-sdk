import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    NotSupportedTokensError,
    RubicSdkError,
    TooLowAmountError
} from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount as RubicTokenAmount } from 'src/common/tokens';
import { TokenStruct } from 'src/common/tokens/token';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import {
    SymbiosisSupportedBlockchain,
    symbiosisSupportedBlockchains
} from 'src/features/common/providers/symbiosis/constants/symbiosis-supported-blockchains';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    errorCode,
    SymbiosisError
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-error';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import {
    SymbiosisToken,
    SymbiosisTokenAmount
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-trade';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

export class SymbiosisCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SymbiosisSupportedBlockchain {
        return symbiosisSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public override areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        if (fromBlockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return false;
        }

        return super.areSupportedBlockchains(fromBlockchain, toBlockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as SymbiosisSupportedBlockchain;
        const toBlockchain = toToken.blockchain as SymbiosisSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;
        // @TODO remove Tron check
        if (
            !this.areSupportedBlockchains(fromBlockchain, toBlockchain) ||
            fromBlockchain === BLOCKCHAIN_NAME.TRON
        ) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const fromAddress =
                options.fromAddress ||
                this.getWalletAddress(fromBlockchain as Web3PrivateSupportedBlockchain) ||
                oneinchApiParams.nativeAddress;

            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            let tokenInAddress;

            if (from.isNative && from.blockchain === BLOCKCHAIN_NAME.METIS) {
                tokenInAddress = '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000';
            } else if (from.isNative) {
                tokenInAddress = '';
            } else {
                tokenInAddress = from.address;
            }

            const tokenIn: SymbiosisToken = {
                chainId: blockchainId[fromBlockchain],
                address: tokenInAddress,
                decimals: from.decimals,
                isNative: from.isNative,
                symbol: from.symbol
            };

            const tokenOut: SymbiosisToken = {
                chainId:
                    toBlockchain !== BLOCKCHAIN_NAME.TRON ? blockchainId[toBlockchain] : 728126428,
                address: toToken.isNative ? '' : toToken.address,
                decimals: toToken.decimals,
                isNative: toToken.isNative,
                symbol: toToken.symbol
            };

            const symbiosisTokenAmountIn: SymbiosisTokenAmount = {
                ...tokenIn,
                amount: fromWithoutFee.stringWeiAmount
            };

            const receiverAddress = options.receiverAddress || fromAddress;

            const deadline = Math.floor(Date.now() / 1000) + 60 * options.deadline;
            const slippageTolerance = options.slippageTolerance * 10000;

            const swapParams: SymbiosisSwappingParams = {
                tokenAmountIn: symbiosisTokenAmountIn,
                tokenOut,
                from: fromAddress,
                to: receiverAddress || fromAddress,
                revertableAddress: fromAddress,
                slippage: slippageTolerance,
                deadline
            };

            const { tokenAmountOut, inTradeType, outTradeType, tx, approveTo, route } =
                await SymbiosisCrossChainTrade.getResponseFromApiToTransactionRequest(swapParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(tokenAmountOut.amount, tokenAmountOut.decimals)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SymbiosisCrossChainTrade.getGasData(
                          from,
                          to,
                          swapParams,
                          feeInfo,
                          approveTo,
                          options.providerAddress,
                          options.receiverAddress
                      )
                    : null;

            return {
                trade: new SymbiosisCrossChainTrade(
                    {
                        from,
                        to,
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        slippage: options.slippageTolerance,
                        swapParams,
                        feeInfo,
                        transitAmount: from.tokenAmount,
                        tradeType: { in: inTradeType, out: outTradeType },
                        contractAddresses: {
                            providerRouter: tx.to!,
                            providerGateway: approveTo
                        }
                    },
                    options.providerAddress,
                    await this.getRoutePath(from, to, route)
                ),
                tradeType: this.type
            };
        } catch (err: unknown) {
            let rubicSdkError = CrossChainProvider.parseError(err);
            const symbiosisMessage = (err as { error: SymbiosisError })?.error?.message;

            if (symbiosisMessage?.includes('$') || symbiosisMessage?.includes('Min amount')) {
                const symbiosisError = (err as { error: SymbiosisError }).error;
                rubicSdkError =
                    symbiosisError.code === errorCode.AMOUNT_LESS_THAN_FEE ||
                    symbiosisError.code === 400
                        ? new TooLowAmountError()
                        : await this.checkMinMaxErrors(symbiosisError);
            } else if (symbiosisMessage) {
                rubicSdkError = new RubicSdkError(symbiosisMessage);
            }

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    private async checkMinMaxErrors(err: SymbiosisError): Promise<RubicSdkError> {
        if (err.code === errorCode.AMOUNT_TOO_LOW) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            return new MinAmountError(transitTokenAmount, 'USDC');
        }

        if (err?.code === errorCode.AMOUNT_TOO_HIGH) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            return new MaxAmountError(transitTokenAmount, 'USDC');
        }

        return new RubicSdkError(err.message);
    }

    protected async getFeeInfo(
        fromBlockchain: SymbiosisSupportedBlockchain,
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

    private getTransferToken(
        route: SymbiosisToken[],
        from: PriceTokenAmount<EvmBlockchainName>
    ): TokenStruct | undefined {
        const fromBlockchainId = blockchainId[from.blockchain];
        const fromRouting = route.filter(token => token.chainId === fromBlockchainId);

        const token = fromRouting.at(-1)!;
        return fromRouting.length !== 1
            ? {
                  address: token.address,
                  decimals: token.decimals,
                  name: token.name!,
                  blockchain: from.blockchain,
                  symbol: token.symbol!
              }
            : undefined;
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount,
        route: SymbiosisToken[]
    ): Promise<RubicStep[]> {
        const fromChainId = blockchainId[fromToken.blockchain];
        const toChainId = blockchainId[toToken.blockchain];

        const transitFrom = [...route].reverse().find(el => el.chainId === fromChainId);
        const transitTo = route.find(el => el.chainId === toChainId);

        const fromTokenAmount = transitFrom
            ? await RubicTokenAmount.createToken({
                  blockchain: fromToken.blockchain,
                  address: transitFrom.address,
                  weiAmount: new BigNumber(0)
              })
            : fromToken;

        const toTokenAmount = transitTo
            ? await RubicTokenAmount.createToken({
                  blockchain: toToken.blockchain,
                  address: transitTo.address,
                  weiAmount: new BigNumber(0)
              })
            : toToken;

        const routePath: RubicStep[] = [];

        if (transitFrom) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
                path: [fromToken, fromTokenAmount]
            });
        }
        routePath.push({
            type: 'cross-chain',
            provider: CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS,
            path: [fromTokenAmount, toTokenAmount]
        });
        if (transitTo) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
                path: [toTokenAmount, toToken]
            });
        }
        return routePath;
    }
}
