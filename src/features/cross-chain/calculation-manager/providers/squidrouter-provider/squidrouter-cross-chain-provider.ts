import BigNumber from 'bignumber.js';
import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { SquidrouterEstimation } from 'src/features/common/providers/squidrouter/models/estimation-response';
import { SquidrouterTransactionRequest } from 'src/features/common/providers/squidrouter/models/transaction-request';
import { SquidRouterApiService } from 'src/features/common/providers/squidrouter/services/squidrouter-api-service';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    SquidrouterCrossChainSupportedBlockchain,
    squidrouterCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-cross-chain-supported-blockchain';
import { SquidrouterCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/squidrouter-cross-chain-trade';

export class SquidrouterCrossChainProvider extends CrossChainProvider {
    private readonly nativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SquidrouterCrossChainSupportedBlockchain {
        return squidrouterCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as SquidrouterCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as SquidrouterCrossChainSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
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

            const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';

            const fromAddress = options?.fromAddress || fakeAddress;

            const receiver = options?.receiverAddress || fromAddress;

            const requestParams: SquidrouterTransactionRequest = {
                fromAddress,
                fromChain: blockchainId[fromBlockchain].toString(),
                fromToken: from.isNative ? this.nativeAddress : from.address,
                fromAmount: fromWithoutFee.stringWeiAmount,
                toChain: blockchainId[toBlockchain].toString(),
                toToken: toToken.isNative ? this.nativeAddress : toToken.address,
                toAddress: receiver,
                slippage: Number(options.slippageTolerance * 100)
            };

            const {
                route: { transactionRequest, estimate }
            } = await SquidRouterApiService.getRoute(requestParams);

            const squidGasData: GasData = {
                gasLimit: new BigNumber(transactionRequest.gasLimit).plus(useProxy ? 120000 : 0),
                gasPrice: new BigNumber(transactionRequest.gasPrice),
                maxFeePerGas: new BigNumber(transactionRequest.maxFeePerGas),
                maxPriorityFeePerGas: new BigNumber(transactionRequest.maxPriorityFeePerGas)
            };

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(estimate.toAmount, toToken.decimals)
            });

            const feeAmount = estimate.feeCosts
                .filter(fee => compareAddresses(this.nativeAddress, fee.token.address))
                .reduce((acc, fee) => acc.plus(fee.amount), new BigNumber(0));
            const nativeToken = nativeTokensList[fromBlockchain];
            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: new BigNumber(feeAmount)
            });
            return {
                trade: new SquidrouterCrossChainTrade(
                    {
                        from,
                        to,
                        gasData: squidGasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        allowanceTarget: transactionRequest.target,
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            ...feeInfo,
                            provider: {
                                cryptoFee: {
                                    amount: Web3Pure.fromWei(feeAmount, nativeToken.decimals),
                                    token: cryptoFeeToken
                                }
                            }
                        },
                        cryptoFeeToken,
                        onChainTrade: null,
                        onChainSubtype: { from: undefined, to: undefined },
                        transactionRequest: requestParams
                    },
                    options.providerAddress,
                    await this.getRoutePath(estimate, from, to),
                    useProxy
                ),
                tradeType: this.type
            };
        } catch (err) {
            let rubicSdkError = CrossChainProvider.parseError(err);
            const httpError = err?.error?.errors?.[0];
            if (httpError?.message) {
                rubicSdkError = new RubicSdkError(httpError.message);
            }

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: SquidrouterCrossChainSupportedBlockchain,
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
        _estimation: SquidrouterEstimation,
        fromToken: PriceTokenAmount,
        to: PriceTokenAmount
    ): Promise<RubicStep[]> {
        // const routePath: RubicStep[] = [];

        // for (const action of estimation.actions) {
        //     const fromTokenAddress =
        //         this.checkIsNativeToken(action.fromToken.address) ?
        //             EvmWeb3Pure.nativeTokenAddress : action.fromToken.address;
        //     const toTokenAddress = this.checkIsNativeToken(action.toToken.address) ?
        //         EvmWeb3Pure.nativeTokenAddress : action.toToken.address;

        //     if (action.fromChain === action.toChain) {
        //         const tokens = await Token.createTokens(
        //             [fromTokenAddress, toTokenAddress],
        //             BlockchainsInfo.getBlockchainNameById(action.fromChain)!
        //         )
        //         routePath.push({
        //             path: tokens,
        //             type: 'on-chain',
        //             provider: action.provider as OnChainTradeType
        //         })
        //     } else {
        //         const fromTransitToken = await PriceTokenAmount.createToken({
        //             address: fromTokenAddress,
        //             blockchain: BlockchainsInfo.getBlockchainNameById(action.fromToken.chainId)!,
        //             weiAmount: new BigNumber(action.fromAmount)
        //         });

        //         const toTransitToken = await PriceTokenAmount.createToken({
        //             address: toTokenAddress,
        //             blockchain: BlockchainsInfo.getBlockchainNameById(action.toToken.chainId)!,
        //             weiAmount: new BigNumber(action.toAmount)
        //         })

        //         routePath.push({
        //             path: [fromTransitToken, toTransitToken],
        //             type: 'cross-chain',
        //             provider: action.provider as CrossChainTradeType
        //         })
        //     }
        // }

        return [
            {
                path: [fromToken, to],
                provider: CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER,
                type: 'cross-chain'
            }
        ];
    }

    private checkIsNativeToken(address: string): boolean {
        return address.includes(this.nativeAddress);
    }
}
