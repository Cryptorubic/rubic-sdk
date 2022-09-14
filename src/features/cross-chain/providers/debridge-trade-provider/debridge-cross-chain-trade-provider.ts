import {
    DeBridgeCrossChainSupportedBlockchain,
    deBridgeCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { DE_BRIDGE_CONTRACT_ADDRESS } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/contract-address';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { TransactionResponse } from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-response';
import { DebridgeCrossChainTrade } from 'src/features/cross-chain/providers/debridge-trade-provider/debridge-cross-chain-trade';
import { Injector } from 'src/core/injector/injector';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { TransactionRequest } from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-request';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

export class DebridgeCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is DeBridgeCrossChainSupportedBlockchain {
        return deBridgeCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public static readonly apiEndpoint = 'https://deswap.debridge.finance/v1.0/transaction';

    private readonly deBridgeReferralCode = '4350';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            DebridgeCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            DebridgeCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !DebridgeCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !DebridgeCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            const fromAddress = options.fromAddress || this.walletAddress;

            await this.checkContractState(
                fromBlockchain,
                DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter
            );

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);

            const feeAmount = Web3Pure.toWei(
                from.tokenAmount.multipliedBy(feeInfo.platformFee!.percent).dividedBy(100),
                from.decimals,
                1
            );
            const tokenAmountIn = from.weiAmount.minus(feeAmount).toFixed(0);

            const slippageTolerance = options.slippageTolerance * 100;

            const requestParams: TransactionRequest = {
                srcChainId: blockchainId[fromBlockchain],
                srcChainTokenIn: from.address,
                srcChainTokenInAmount: tokenAmountIn,
                slippage: slippageTolerance,
                dstChainId: blockchainId[toBlockchain],
                dstChainTokenOut: toToken.address,
                dstChainTokenOutRecipient: EvmWeb3Pure.EMPTY_ADDRESS,
                referralCode: this.deBridgeReferralCode
            };

            const { tx, estimation } = await Injector.httpClient.get<TransactionResponse>(
                DebridgeCrossChainTradeProvider.apiEndpoint,
                {
                    params: requestParams as unknown as {}
                }
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(
                    estimation.dstChainTokenOut.amount,
                    estimation.dstChainTokenOut.decimals
                )
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await DebridgeCrossChainTrade.getGasData(from, to, requestParams)
                    : null;

            const transitToken = estimation.srcChainTokenOut;

            const cryptoFeeAmount = new BigNumber(tx.value).minus(
                from.isNative ? from.stringWeiAmount : 0
            );

            const nativeToken = nativeTokensList[fromBlockchain];
            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: cryptoFeeAmount
            });

            return {
                trade: new DebridgeCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest: {
                            ...requestParams,
                            dstChainTokenOutRecipient: fromAddress
                        },
                        gasData,
                        // @TODO price impact
                        priceImpact: 0,
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            ...feeInfo,
                            cryptoFee: {
                                amount: Web3Pure.fromWei(cryptoFeeAmount),
                                tokenSymbol: nativeTokensList[fromBlockchain].symbol
                            }
                        },
                        transitAmount: Web3Pure.fromWei(transitToken.amount, transitToken.decimals),
                        cryptoFeeToken
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            const rubicSdkError = CrossChainTradeProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: DeBridgeCrossChainSupportedBlockchain,
        providerAddress: string
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: 'USDC'
            },
            cryptoFee: null
        };
    }
}
