import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { UniZenTradeInfo } from 'src/features/common/providers/unizen/models/cross-chain-models/unizen-ccr-quote-response';
import { UniZenCcrQuoteParams } from 'src/features/common/providers/unizen/models/unizen-quote-params';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    UniZenCcrSupportedChain,
    uniZenCcrSupportedChains
} from './constants/unizen-ccr-supported-chains';
import {
    uniZenContractAddresses,
    UniZenContractVersion
} from './constants/unizen-contract-addresses';
import {
    UniZenCcrTradeDex,
    uniZenCcrTradeDexes,
    UniZenCcrTradeProvider,
    uniZenCcrTradeProviders
} from './constants/unizen-trade-providers';
import { UniZenCcrUtilsService } from './services/unizen-ccr-utils-service';
import { UniZenCcrTrade } from './unizen-ccr-trade';

export class UniZenCcrProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.UNIZEN;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return uniZenCcrSupportedChains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const useProxy = options?.useProxy?.[this.type] ?? true;

        const fromBlockchain = from.blockchain as UniZenCcrSupportedChain;
        const toBlockchain = toToken.blockchain as UniZenCcrSupportedChain;

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
            const walletAddress =
                Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
            const fromAddress = walletAddress || FAKE_WALLET_ADDRESS;

            const srcChainId = blockchainId[fromBlockchain];

            const quoteSendParams: UniZenCcrQuoteParams = {
                fromTokenAddress: from.address,
                toTokenAddress: toToken.address,
                amount: fromWithoutFee.stringWeiAmount,
                slippage: options.slippageTolerance,
                sender: fromAddress,
                destinationChainId: blockchainId[toBlockchain]
            };

            const quoteInfo = await UniZenCcrUtilsService.getBestQuote(quoteSendParams, srcChainId);

            const nativeToken = nativeTokensList[fromBlockchain];

            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: new BigNumber(quoteInfo.nativeFee ?? 0)
            });

            const contractVersion =
                quoteInfo.contractVersion.toLowerCase() as UniZenContractVersion;

            const contractAddress = uniZenContractAddresses[contractVersion]?.[fromBlockchain]!;

            if (!contractAddress) {
                throw new RubicSdkError(
                    `There is no contract of ${quoteInfo.contractVersion} version`
                );
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(quoteInfo.transactionData.params.actualQuote)
            });

            const toTokenAmountMin = Web3Pure.fromWei(
                quoteInfo.transactionData.params.minQuote,
                to.decimals
            );

            const routePath = await this.getRoutePath(
                from,
                to,
                quoteInfo.tradeProtocol,
                quoteInfo.srcTrade,
                quoteInfo.dstTrade
            );

            const trade = new UniZenCcrTrade(
                {
                    from,
                    feeInfo: {
                        ...feeInfo,
                        ...(quoteInfo.nativeFee && {
                            provider: {
                                cryptoFee: {
                                    amount: Web3Pure.fromWei(
                                        quoteInfo.nativeFee,
                                        nativeToken.decimals
                                    ),
                                    token: cryptoFeeToken
                                }
                            }
                        })
                    },
                    to,
                    slippage: options.slippageTolerance,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    gasData: await this.getGasData(from),
                    contractAddress,
                    toTokenAmountMin
                },
                options.providerAddress,
                routePath,
                useProxy
            );

            return {
                trade,
                tradeType: this.type
            };
        } catch (error) {
            return {
                error,
                trade: null,
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        tradeProtocol: UniZenCcrTradeProvider,
        srcTrade: UniZenTradeInfo,
        dstTrade: UniZenTradeInfo
    ): Promise<RubicStep[]> {
        const isSrcTrade = !!srcTrade.tokenTo;
        const isDstTrade = !!dstTrade.tokenFrom;
        const path: RubicStep[] = [];

        const fromTransitToken = isSrcTrade
            ? await TokenAmount.createToken({
                  address: srcTrade.tokenTo.contractAddress,
                  weiAmount: new BigNumber(srcTrade.toTokenAmount),
                  blockchain: from.blockchain
              })
            : from;

        const toTransitToken = isDstTrade
            ? await TokenAmount.createToken({
                  address: dstTrade.tokenFrom.contractAddress,
                  weiAmount: new BigNumber(dstTrade.fromTokenAmount),
                  blockchain: to.blockchain
              })
            : to;

        if (isSrcTrade) {
            const protocol = srcTrade.protocol[0]?.name as UniZenCcrTradeDex;

            const subProvider = uniZenCcrTradeDexes[protocol] || ON_CHAIN_TRADE_TYPE.UNIZEN;

            path.push({
                type: 'on-chain',
                path: [from, fromTransitToken],
                provider: subProvider
            });
        }

        const uniZenBridge =
            uniZenCcrTradeProviders[tradeProtocol] || CROSS_CHAIN_TRADE_TYPE.UNIZEN;

        path.push({
            type: 'cross-chain',
            path: [fromTransitToken, toTransitToken],
            provider: uniZenBridge
        });

        if (isDstTrade) {
            const protocol = dstTrade.protocol[0]?.name as UniZenCcrTradeDex;

            const subProvider = uniZenCcrTradeDexes[protocol] || ON_CHAIN_TRADE_TYPE.UNIZEN;

            path.push({
                type: 'on-chain',
                path: [toTransitToken, to],
                provider: subProvider
            });
        }

        return path;
    }

    public async getFeeInfo(
        fromBlockchain: EvmBlockchainName,
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
}
