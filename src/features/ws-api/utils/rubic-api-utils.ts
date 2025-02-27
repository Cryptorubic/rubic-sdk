import {
    blockchainId,
    CrossChainTradeType,
    QuoteRequestInterface,
    QuoteResponseInterface
} from '@cryptorubic/core';
import { Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';

export class RubicApiUtils {
    public static async getEmptyResponse(
        quote: QuoteRequestInterface,
        providerType: string
    ): Promise<QuoteResponseInterface> {
        const [fromToken, toToken] = await Promise.all([
            Token.createToken({
                address: quote.srcTokenAddress,
                blockchain: quote.srcTokenBlockchain
            }),
            Token.createToken({
                address: quote.dstTokenAddress,
                blockchain: quote.dstTokenBlockchain
            })
        ]);

        const swapType = fromToken.blockchain === toToken.blockchain ? 'on-chain' : 'cross-chain';

        const srcChainId = blockchainId[fromToken.blockchain];
        const dstChainId = blockchainId[toToken.blockchain];
        const nativeToken = nativeTokensList[fromToken.blockchain];

        const emptyResponse: QuoteResponseInterface = {
            providerType: providerType as CrossChainTradeType,
            swapType,
            transaction: {},
            id: '0',
            warnings: [],
            routing: [
                {
                    path: [
                        {
                            ...fromToken,
                            amount: '0',
                            blockchainId: srcChainId
                        },
                        {
                            ...toToken,
                            amount: '0',
                            blockchainId: dstChainId
                        }
                    ],
                    provider: providerType,
                    type: swapType
                }
            ],
            estimate: {
                destinationTokenAmount: '0',
                destinationTokenMinAmount: '0',
                destinationWeiAmount: '0',
                destinationWeiMinAmount: '0',
                slippage: quote.slippage || 0,
                priceImpact: 0,
                durationInMinutes: 0
            },
            tokens: {
                from: {
                    ...fromToken,
                    blockchainId: srcChainId
                },
                to: {
                    ...toToken,
                    blockchainId: dstChainId
                }
            },
            fees: {
                gasTokenFees: {
                    nativeToken: {
                        ...nativeToken,
                        blockchainId: srcChainId
                    },
                    protocol: {
                        fixedAmount: '0',
                        fixedUsdAmount: 0,
                        fixedWeiAmount: '0'
                    },
                    provider: {
                        fixedAmount: '0',
                        fixedUsdAmount: 0,
                        fixedWeiAmount: '0'
                    },
                    gas: {
                        gasPrice: '0',
                        gasLimit: '0',
                        totalWeiAmount: '0',
                        totalUsdAmount: 0
                    }
                },
                percentFees: {
                    percent: 0,
                    token: {
                        ...fromToken,
                        blockchainId: srcChainId
                    }
                }
            }
        };

        return emptyResponse;
    }
}
