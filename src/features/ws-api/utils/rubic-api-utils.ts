import {
    blockchainId,
    CrossChainTradeType,
    QuoteRequestInterface,
    QuoteResponseInterface,
    TokenInerface
} from '@cryptorubic/core';
import { Address } from '@ton/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

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

    public static getFromToTokens(
        tokens: {
            from: TokenInerface;
            to: TokenInerface;
        },
        fromAmount: string,
        toAmount: string
    ): {
        fromToken: PriceTokenAmount;
        toToken: PriceTokenAmount;
    } {
        const fromTokenAddress = RubicApiUtils.parseTokenAddress(tokens.from);
        const toTokenAddress = RubicApiUtils.parseTokenAddress(tokens.to);

        const fromToken = new PriceTokenAmount({
            ...tokens.from,
            address: fromTokenAddress,
            price: new BigNumber(tokens.from.price || NaN),
            tokenAmount: new BigNumber(fromAmount)
        });
        const toToken = new PriceTokenAmount({
            ...tokens.to,
            address: toTokenAddress,
            price: new BigNumber(tokens.to.price || NaN),
            tokenAmount: new BigNumber(toAmount)
        });

        return { fromToken, toToken };
    }

    private static parseTokenAddress(token: TokenInerface): string {
        const chainType = BlockchainsInfo.getChainType(token.blockchain);
        const isNativeToken = Web3Pure[chainType]?.isNativeAddress(token.address);

        if (isNativeToken) {
            return token.address;
        }

        if (chainType === CHAIN_TYPE.TON) {
            return Address.parseRaw(token.address).toString();
        }

        return token.address;
    }
}
