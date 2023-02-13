import BigNumber from 'bignumber.js';
import { InsufficientLiquidityError, MinAmountError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { TokenStruct } from 'src/common/tokens/token';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { MultichainProxyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { symbiosisTransitTokens } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-transit-tokens';
import { XyStatusCode } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-status-code';
import {
    XyCrossChainSupportedBlockchain,
    xySupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-supported-blockchains';
import { XyTransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-transaction-request';
import { XyTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-transaction-response';
import { XyCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-trade';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class XyCrossChainProvider extends CrossChainProvider {
    public static readonly apiEndpoint = 'https://open-api.xy.finance/v1';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.XY;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is XyCrossChainSupportedBlockchain {
        return xySupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as XyCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as XyCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const receiverAddress =
                options.receiverAddress || this.getWalletAddress(fromBlockchain);

            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                fromToken
            );

            const fromWithoutFee = getFromWithoutFee(
                fromToken,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const slippageTolerance = options.slippageTolerance * 100;

            const transitToken =
                symbiosisTransitTokens[fromBlockchain as SymbiosisCrossChainSupportedBlockchain];
            const onChainTrade = (await this.getOnChainTrade(
                fromWithoutFee,
                transitToken,
                [],
                (options.slippageTolerance - 0.005) / 2
            ))!;

            const requestParams: XyTransactionRequest = {
                srcChainId: String(blockchainId[fromBlockchain]),
                fromTokenAddress: fromToken.isNative
                    ? XyCrossChainTrade.nativeAddress
                    : fromToken.address,
                amount: fromToken.stringWeiAmount,
                slippage: String(slippageTolerance),
                destChainId: blockchainId[toBlockchain],
                toTokenAddress: toToken.isNative
                    ? XyCrossChainTrade.nativeAddress
                    : toToken.address,
                receiveAddress: receiverAddress || EvmWeb3Pure.EMPTY_ADDRESS
            };

            const { toTokenAmount, statusCode, msg, xyFee } =
                await Injector.httpClient.get<XyTransactionResponse>(
                    `${XyCrossChainProvider.apiEndpoint}/swap`,
                    {
                        params: { ...requestParams }
                    }
                );
            this.analyzeStatusCode(statusCode, msg);

            feeInfo.provider = {
                cryptoFee: {
                    amount: new BigNumber(xyFee!.amount),
                    tokenSymbol: xyFee!.symbol
                }
            };

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(toTokenAmount, toToken.decimals)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await XyCrossChainTrade.getGasData(fromToken, to, requestParams)
                    : null;

            return {
                trade: new XyCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        transactionRequest: {
                            ...requestParams,
                            receiveAddress: receiverAddress
                        },
                        gasData,
                        priceImpact: fromToken.calculatePriceImpactPercent(to) || 0,
                        slippage: options.slippageTolerance,
                        feeInfo,
                        onChainTrade
                    },
                    options.providerAddress
                )
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: XyCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        const fixedFeeAmount = await this.getFixedFee(
            fromBlockchain as EvmBlockchainName,
            providerAddress,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        const feePercent = await this.getFeePercent(
            fromBlockchain as EvmBlockchainName,
            providerAddress,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        return {
            rubicProxy: {
                fixedFee: {
                    amount: fixedFeeAmount,
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: feePercent,
                    tokenSymbol: percentFeeToken.symbol
                }
            }
        };
    }

    private analyzeStatusCode(code: XyStatusCode, message: string): void {
        switch (code) {
            case '0':
                break;
            case '3':
            case '4':
                throw new InsufficientLiquidityError();
            case '6': {
                const [minAmount, tokenSymbol] = message.split('to ')[1]!.slice(0, -1).split(' ');
                throw new MinAmountError(new BigNumber(minAmount!), tokenSymbol!);
            }
            case '5':
            case '10':
            case '99':
            default:
                throw new RubicSdkError('Unknown Error.');
        }
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        transitToken: TokenStruct<BlockchainName>,
        _availableDexes: string[],
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as MultichainProxyCrossChainSupportedBlockchain;
        if (compareAddresses(from.address, transitToken.address)) {
            return null;
        }

        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            el => el.type === ON_CHAIN_TRADE_TYPE.QUICK_SWAP
        );
        //     .filter(
        //     dex => dex.supportReceiverAddress
        // );
        const to = await PriceToken.createToken(transitToken);
        const allOnChainTrades = await Promise.allSettled(
            dexes.map(dex =>
                dex.calculate(from, to, {
                    slippageTolerance,
                    gasCalculation: 'disabled',
                    useProxy: false
                })
            )
        );
        const successSortedTrades = allOnChainTrades
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            // .filter(onChainTrade =>
            //     availableDexes.some(availableDex =>
            //         compareAddresses(availableDex, onChainTrade.dexContractAddress)
            //     )
            // )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!successSortedTrades.length) {
            return null;
        }
        return successSortedTrades[0]!;
    }
}
