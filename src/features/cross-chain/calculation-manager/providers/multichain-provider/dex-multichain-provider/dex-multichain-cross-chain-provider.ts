import BigNumber from 'bignumber.js';
import { NotSupportedTokensError, NotWhitelistedProviderError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { wlContractAbi } from 'src/features/common/constants/wl-contract-abi';
import { wlContractAddress } from 'src/features/common/constants/wl-contract-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { multichainProxyContractAbi } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/constants/contract-abi';
import { multichainProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/constants/contract-address';
import { DexMultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/dex-multichain-cross-chain-trade';
import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { MultichainTargetToken } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { MultichainCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-provider';
import { getMultichainTokens } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-multichain-tokens';
import { getToFeeAmount } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-to-fee-amount';
import { isMultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/is-multichain-method-name';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class DexMultichainCrossChainProvider extends MultichainCrossChainProvider {
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
            await this.checkContractState(
                fromBlockchain,
                multichainProxyContractAddress[fromBlockchain],
                multichainProxyContractAbi
            );
            const sourceTransitToken = await this.getSourceTransitToken(fromBlockchain, toToken);
            if (!sourceTransitToken) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            const tokens = await getMultichainTokens(
                {
                    blockchain: fromBlockchain,
                    address: sourceTransitToken.address,
                    isNative: sourceTransitToken.tokenType === 'NATIVE'
                },
                toBlockchain
            );
            const routerMethodName = tokens?.targetToken.routerABI.split('(')[0]!;
            if (!tokens || !isMultichainMethodName(routerMethodName)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }
            const { targetToken } = tokens;

            await this.checkProviderIsWhitelisted(fromBlockchain, targetToken.router);
            const whitelistedDexes = await this.getWhitelistedDexes(fromBlockchain);

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );
            const cryptoFee = this.getProtocolFee(targetToken, from.tokenAmount);

            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount: BigNumber;
            let transitMinAmount: BigNumber;

            if (
                (from.isNative && sourceTransitToken.tokenType === 'NATIVE') ||
                compareAddresses(from.address, sourceTransitToken.address)
            ) {
                transitTokenAmount = fromWithoutFee.tokenAmount;
                transitMinAmount = transitTokenAmount;
            } else {
                onChainTrade = await this.getOnChainTrade(
                    fromWithoutFee,
                    sourceTransitToken,
                    whitelistedDexes,
                    options.slippageTolerance
                );
                if (!onChainTrade) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }

                transitTokenAmount = onChainTrade.to.tokenAmount;
                transitMinAmount = onChainTrade.toTokenAmountMin.tokenAmount;
            }
            const feeToAmount = getToFeeAmount(transitTokenAmount, targetToken);
            const toAmount = transitTokenAmount.minus(feeToAmount);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });
            const toTokenAmountMin = transitMinAmount.minus(feeToAmount);

            const routerAddress = targetToken.router;
            const spenderAddress = targetToken.spender;
            const anyTokenAddress = targetToken.fromanytoken.address;
            const gasData =
                options.gasCalculation === 'enabled'
                    ? await DexMultichainCrossChainTrade.getGasData(
                          from,
                          to,
                          routerAddress,
                          spenderAddress,
                          routerMethodName,
                          anyTokenAddress,
                          onChainTrade
                      )
                    : null;

            const trade = new DexMultichainCrossChainTrade(
                {
                    from,
                    to,
                    gasData,
                    priceImpact: onChainTrade?.from
                        ? from.calculatePriceImpactPercent(onChainTrade?.to) || 0
                        : 0,
                    toTokenAmountMin,
                    feeInfo: {
                        ...feeInfo,
                        provider: {
                            cryptoFee
                        }
                    },
                    routerAddress,
                    spenderAddress,
                    routerMethodName,
                    anyTokenAddress,
                    onChainTrade,
                    slippage: options.slippageTolerance
                },
                options.providerAddress
            );

            try {
                this.checkMinMaxErrors(
                    { tokenAmount: transitTokenAmount, symbol: sourceTransitToken.symbol },
                    { tokenAmount: transitMinAmount, symbol: sourceTransitToken.symbol },
                    targetToken,
                    feeInfo
                );
            } catch (error) {
                return {
                    trade,
                    error
                };
            }
            return { trade };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    protected async checkProviderIsWhitelisted(
        fromBlockchain: Web3PublicSupportedBlockchain,
        providerRouter: string
    ): Promise<void> {
        const whitelistedContracts = await Injector.web3PublicService
            .getWeb3Public(fromBlockchain)
            .callContractMethod<string[]>(
                wlContractAddress[fromBlockchain as EvmBlockchainName],
                wlContractAbi,
                'getAvailableAnyRouters'
            );

        if (
            !whitelistedContracts.find(whitelistedContract =>
                compareAddresses(whitelistedContract, providerRouter)
            )
        ) {
            throw new NotWhitelistedProviderError(
                providerRouter,
                undefined,
                'multichain:anyrouter'
            );
        }
    }

    private async getSourceTransitToken(
        fromBlockchain: BlockchainName,
        toToken: Token
    ): Promise<MultichainTargetToken | null> {
        const tokens = await getMultichainTokens(toToken, fromBlockchain);
        if (!tokens) {
            return null;
        }
        return tokens.targetToken;
    }

    private getWhitelistedDexes(
        fromBlockchain: MultichainProxyCrossChainSupportedBlockchain
    ): Promise<string[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        return web3Public.callContractMethod<string[]>(
            multichainProxyContractAddress[fromBlockchain],
            multichainProxyContractAbi,
            'getAvailableRouters'
        );
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        transitToken: MultichainTargetToken,
        availableDexes: string[],
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as MultichainProxyCrossChainSupportedBlockchain;

        // @TODO Add filter before promise resolving.
        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            dex => dex.supportReceiverAddress
        );
        const to = await PriceToken.createToken({
            address:
                transitToken.tokenType === 'NATIVE'
                    ? EvmWeb3Pure.nativeTokenAddress
                    : transitToken.address,
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
                    compareAddresses(availableDex, onChainTrade.dexContractAddress)
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
            rubicProxy: {
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
                }
            }
        };
    }
}
