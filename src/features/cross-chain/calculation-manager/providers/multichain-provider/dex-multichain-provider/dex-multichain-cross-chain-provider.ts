import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/calculation-manager/utils/get-from-without-fee';
import { MultichainTokensResponse } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import { isMultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/is-multichain-method-name';
import { MultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-trade';
import { MultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/multichain-method-name';
import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { multichainProxyContractAbi } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/constants/contract-abi';
import { multichainProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/constants/contract-address';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Injector } from 'src/core/injector/injector';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { DexMultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/dex-multichain-cross-chain-trade';
import { getMultichainTokens } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/utils/get-multichain-tokens';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/abstract/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class DexMultichainCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.MULTICHAIN;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is MultichainProxyCrossChainSupportedBlockchain {
        return multichainProxyCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as MultichainProxyCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as MultichainProxyCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const fromChainId = blockchainId[fromBlockchain];
            const sourceTransitTokenAddress = await this.getTransitTokenAddress(
                fromBlockchain,
                toToken
            );
            if (!sourceTransitTokenAddress) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            const toChainId = blockchainId[toBlockchain];
            const tokensList = await this.httpClient.get<MultichainTokensResponse>(
                `https://bridgeapi.anyswap.exchange/v4/tokenlistv4/${fromChainId}`
            );
            const sourceToken = Object.entries(tokensList).find(([address, token]) => {
                return (
                    (token.tokenType === 'NATIVE' && from.isNative) ||
                    (token.tokenType === 'TOKEN' &&
                        address.toLowerCase().endsWith(from.address.toLowerCase()))
                );
            })?.[1];
            const dstChainInformation = sourceToken?.destChains[toChainId.toString()];
            if (!sourceToken || !dstChainInformation) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            const targetToken = Object.entries(dstChainInformation).find(([_hash, token]) => {
                const routerAbi = token.routerABI;
                return isMultichainMethodName(routerAbi.split('(')[0]!);
            })?.[1];
            if (!targetToken) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }
            const routerMethodName = targetToken.routerABI.split('(')[0]! as MultichainMethodName;

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const fromWithoutFee = getFromWithoutFee(from, feeInfo);

            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount: BigNumber;
            let toAmount: BigNumber;
            if (compareAddresses(from.address, sourceTransitTokenAddress)) {
                transitTokenAmount = fromWithoutFee.tokenAmount;
                const feeAmount = BigNumber.min(
                    BigNumber.max(
                        transitTokenAmount.multipliedBy(targetToken.SwapFeeRatePerMillion / 100),
                        new BigNumber(targetToken.MinimumSwapFee)
                    ),
                    new BigNumber(targetToken.MaximumSwapFee)
                );
                toAmount = transitTokenAmount.minus(feeAmount);

                from = new PriceTokenAmount({
                    ...from.asStructWithAmount,
                    price: new BigNumber(sourceToken.price)
                });
            } else {
                onChainTrade = await this.getOnChainTrade(
                    fromWithoutFee,
                    sourceTransitTokenAddress,
                    options.slippageTolerance
                );
                if (!onChainTrade) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }

                // @todo add from price

                transitTokenAmount = onChainTrade.to.tokenAmount;
                const feeAmount = BigNumber.min(
                    BigNumber.max(
                        transitTokenAmount.multipliedBy(targetToken.SwapFeeRatePerMillion / 100),
                        new BigNumber(targetToken.MinimumSwapFee)
                    ),
                    new BigNumber(targetToken.MaximumSwapFee)
                );
                toAmount = transitTokenAmount.minus(feeAmount);
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });
            const toTokenAmountMin = to.tokenAmount;

            const routerAddress = targetToken.router;
            const spenderAddress = targetToken.spender;
            const anyTokenAddress = targetToken.fromanytoken.address;
            const gasData =
                options.gasCalculation === 'enabled'
                    ? await MultichainCrossChainTrade.getGasData(
                          from,
                          to,
                          routerAddress,
                          spenderAddress,
                          routerMethodName,
                          anyTokenAddress
                      )
                    : null;

            const trade = new DexMultichainCrossChainTrade(
                {
                    from,
                    to,
                    gasData,
                    priceImpact: from.calculatePriceImpactPercent(to) || 0,
                    toTokenAmountMin,
                    feeInfo,
                    routerAddress,
                    spenderAddress,
                    routerMethodName,
                    anyTokenAddress,
                    onChainTrade
                },
                options.providerAddress
            );

            if (transitTokenAmount.lt(targetToken.MinimumSwap)) {
                const minimumAmount = new BigNumber(targetToken.MinimumSwap)
                    .dividedBy(1 - (feeInfo.platformFee?.percent || 0) / 100)
                    .toFixed(5, 0);
                return {
                    trade,
                    error: new MinAmountError(new BigNumber(minimumAmount), sourceToken.symbol)
                };
            }
            if (transitTokenAmount.gt(targetToken.MaximumSwap)) {
                const maximumAmount = new BigNumber(targetToken.MaximumSwap)
                    .dividedBy(1 - (feeInfo.platformFee?.percent || 0) / 100)
                    .toFixed(5, 1);
                return {
                    trade,
                    error: new MaxAmountError(new BigNumber(maximumAmount), sourceToken.symbol)
                };
            }

            return {
                trade
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    private async getTransitTokenAddress(
        fromBlockchain: BlockchainName,
        toToken: Token
    ): Promise<string | null> {
        const tokens = await getMultichainTokens(toToken, fromBlockchain);
        if (!tokens) {
            return null;
        }
        return tokens.targetToken.address;
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        transitTokenAddress: string,
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as MultichainProxyCrossChainSupportedBlockchain;
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const availableDexes = await web3Public.callContractMethod<string[]>(
            multichainProxyContractAddress[fromBlockchain],
            multichainProxyContractAbi,
            'getAvailableRouters'
        );

        // @todo add filter
        const dexes = Object.values(typedTradeProviders[fromBlockchain]);
        const to = await PriceToken.createToken({
            address: transitTokenAddress,
            blockchain: fromBlockchain
        });
        const onChainTrades = (
            await Promise.allSettled(
                dexes.map(dex =>
                    dex.calculate(from, to, {
                        slippageTolerance,
                        gasCalculation: 'disabled'
                    })
                )
            )
        )
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            .filter(onChainTrade =>
                availableDexes.some(availableDex =>
                    compareAddresses(availableDex, onChainTrade.contractAddress)
                )
            )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!onChainTrades.length) {
            return null;
        }
        return onChainTrades[0]!;
    }

    protected override async getFeeInfo(
        fromBlockchain: MultichainProxyCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    multichainProxyContractAddress[fromBlockchain],
                    multichainProxyContractAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    multichainProxyContractAddress[fromBlockchain],
                    multichainProxyContractAbi
                ),
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
        };
    }
}
