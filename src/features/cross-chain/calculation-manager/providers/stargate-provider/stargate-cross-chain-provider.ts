import BigNumber from 'bignumber.js';
import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { TokenStruct } from 'src/common/tokens/token';
import { compareAddresses } from 'src/common/utils/blockchain';
import { parseError } from 'src/common/utils/errors';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
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
import { feeLibraryAbi } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/fee-library-abi';
import { StargateBridgeToken } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { stargateFeeLibraryContractAddress } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-fee-library-contract-address';
import { stargatePoolAbi } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-abi';
import { stargatePoolId } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-id';
import { stargatePoolMapping } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-mapping';
import { stargatePoolsDecimals } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pools-decimals';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { stargateBlockchainSupportedPools } from './constants/stargate-blockchain-supported-pool';
import { stargateChainId } from './constants/stargate-chain-id';
import { stargateContractAddress } from './constants/stargate-contract-address';
import {
    StargateCrossChainSupportedBlockchain,
    stargateCrossChainSupportedBlockchains
} from './constants/stargate-cross-chain-supported-blockchain';
import { stargateRouterAbi } from './constants/stargate-router-abi';
import { StargateCrossChainTrade } from './stargate-cross-chain-trade';

export class StargateCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is StargateCrossChainSupportedBlockchain {
        return stargateCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private static checkIsSupportedTokens(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>
    ): boolean {
        const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = to.blockchain as StargateCrossChainSupportedBlockchain;
        const srcPoolId = stargatePoolId[from.symbol as StargateBridgeToken];
        if (!srcPoolId) {
            return false;
        }
        const dstPoolId = stargatePoolId[to.symbol as StargateBridgeToken];
        const srcSupportedPools = stargateBlockchainSupportedPools[fromBlockchain];
        const dstSupportedPools = stargateBlockchainSupportedPools[toBlockchain];

        const poolPathExists =
            stargatePoolMapping[fromBlockchain]?.[from.symbol as StargateBridgeToken]?.[
                toBlockchain
            ]?.includes(dstPoolId);

        if (!dstSupportedPools.includes(dstPoolId)) {
            throw new RubicSdkError('Tokens are not supported.');
        }

        return !(srcSupportedPools.includes(srcPoolId) && !poolPathExists);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        try {
            const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
            const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;

            if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            const hasDirectRoute = StargateCrossChainProvider.checkIsSupportedTokens(from, toToken);
            if (hasDirectRoute) {
                await this.checkEqFee(from, toToken);
            }

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const transitToken = hasDirectRoute
                ? from
                : await this.getPoolToken(1, from.blockchain);

            let onChainTrade: EvmOnChainTrade | null = null;

            if (!hasDirectRoute) {
                // @TODO CCR
                // const compexRoute = await this.calculateComplexRoute(from, toToken);
                onChainTrade = await this.getOnChainTrade(
                    fromWithoutFee,
                    transitToken,
                    [],
                    options.slippageTolerance
                );
                if (!onChainTrade) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }
            }

            const poolFee = await this.fetchPoolFees(fromWithoutFee, toToken);
            const amountOutMin = fromWithoutFee.tokenAmount.minus(poolFee);
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: amountOutMin
            });

            const layerZeroFeeWei = await this.getLayerZeroFee(from, to, amountOutMin);
            const layerZeroFeeAmount = Web3Pure.fromWei(
                layerZeroFeeWei,
                nativeTokensList[fromBlockchain].decimals
            );
            feeInfo.provider = {
                cryptoFee: {
                    amount: layerZeroFeeAmount,
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                }
            };

            return {
                trade: new StargateCrossChainTrade(
                    {
                        from,
                        to,
                        toTokenAmountMin: amountOutMin,
                        slippageTolerance: options.slippageTolerance,
                        priceImpact: null,
                        gasData: null,
                        feeInfo,
                        onChainTrade
                    },
                    options.providerAddress
                )
            };
        } catch (error) {
            console.error({ 'CALCULATE ERROR': error });
            return {
                trade: null,
                error: parseError(error)
            };
        }
    }

    private async getLayerZeroFee(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        amountOutMin: BigNumber
    ): Promise<BigNumber> {
        const layzerZeroTxData = await StargateCrossChainTrade.getLayerZeroSwapData(
            from,
            to,
            amountOutMin
        );
        const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
        const walletAddress = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address;
        const layerZeroFee = await web3Public.callContractMethod(
            stargateContractAddress[from.blockchain as StargateCrossChainSupportedBlockchain],
            stargateRouterAbi,
            'quoteLayerZeroFee',
            [
                stargateChainId[to.blockchain as StargateCrossChainSupportedBlockchain],
                1,
                walletAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                layzerZeroTxData.data,
                ['0', '0', walletAddress || EvmWeb3Pure.EMPTY_ADDRESS]
            ]
        );
        return new BigNumber(`${layerZeroFee['0']!}`);
    }

    protected async getFeeInfo(
        fromBlockchain: Partial<EvmBlockchainName>,
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

    private async checkEqFee(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<void> {
        const fromBlockchain = fromToken.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;
        const srcPoolId = stargatePoolId[fromToken.symbol as StargateBridgeToken];
        const dstPoolId = stargatePoolId[toToken.symbol as StargateBridgeToken];
        const dstChainId = stargateChainId[toBlockchain as StargateCrossChainSupportedBlockchain];
        const amountSD = Web3Pure.toWei(
            fromToken.tokenAmount,
            stargatePoolsDecimals[fromToken.symbol as StargateBridgeToken]
        );
        const whitelisted = false;
        const hasEqReward = false;

        try {
            const { 0: fee, 1: protocolSubsidy } = await Injector.web3PublicService
                .getWeb3Public(fromBlockchain)
                .callContractMethod<{ 0: string; 1: string }>(
                    stargateFeeLibraryContractAddress[fromBlockchain],
                    feeLibraryAbi,
                    'getEquilibriumFee',
                    [srcPoolId, dstPoolId, dstChainId, amountSD, whitelisted, hasEqReward]
                );

            if (new BigNumber(protocolSubsidy).lt(fee)) {
                throw new RubicSdkError('Rebalancing need detected.');
            }
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes('Rebalancing need detected.')) {
                    throw err;
                }
                throw new RubicSdkError('Tokens are not supported.');
            }
        }
    }

    private async fetchPoolFees(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<BigNumber> {
        const fromBlockchain = fromToken.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;
        const srcPoolId = stargatePoolId[fromToken.symbol as StargateBridgeToken];
        const dstPoolId = stargatePoolId[toToken.symbol as StargateBridgeToken];
        const dstChainId = stargateChainId[toBlockchain as StargateCrossChainSupportedBlockchain];

        const sdDecimals = stargatePoolsDecimals[fromToken.symbol as StargateBridgeToken];
        const amountSD = Web3Pure.toWei(fromToken.tokenAmount, sdDecimals);

        try {
            const { 1: eqFee, 4: protocolFee } = await Injector.web3PublicService
                .getWeb3Public(fromBlockchain)
                .callContractMethod<{ 1: string; 4: string }>(
                    stargateFeeLibraryContractAddress[fromBlockchain],
                    feeLibraryAbi,
                    'getFees',
                    [
                        srcPoolId,
                        dstPoolId,
                        dstChainId,
                        this.getWalletAddress(fromBlockchain),
                        amountSD
                    ]
                );

            return Web3Pure.fromWei(new BigNumber(eqFee).plus(protocolFee), sdDecimals);
        } catch (err) {
            if (err instanceof Error) {
                throw new RubicSdkError('Tokens are not supported.');
            }
            throw new RubicSdkError('Unknown error.');
        }
    }

    private async fetchMultiplePoolFees(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<{ amount: BigNumber; pool: number }[]> {
        const fromBlockchain = fromToken.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;
        const srcPools = stargateBlockchainSupportedPools[fromBlockchain];
        const dstPoolId = stargatePoolId[toToken.symbol as StargateBridgeToken];
        const dstChainId = stargateChainId[toBlockchain as StargateCrossChainSupportedBlockchain];
        const wallet = this.getWalletAddress(fromBlockchain);

        const sdDecimals = stargatePoolsDecimals[fromToken.symbol as StargateBridgeToken];
        const amountSD = Web3Pure.toWei(fromToken.tokenAmount, sdDecimals);

        try {
            const feeResponses = await Injector.web3PublicService
                .getWeb3Public(fromBlockchain)
                .multicallContractMethod<{ 1: string; 4: string }>(
                    stargateFeeLibraryContractAddress[fromBlockchain],
                    feeLibraryAbi,
                    'getFees',
                    srcPools.map(srcPoolId => [srcPoolId, dstPoolId, dstChainId, wallet, amountSD])
                );

            return feeResponses
                .map((feeResponse, index) => {
                    if (feeResponse.success && feeResponse.output) {
                        const { 1: eqFee, 4: protocolFee } = feeResponse.output;
                        return {
                            amount: new BigNumber(eqFee).plus(protocolFee),
                            pool: srcPools[index]!
                        };
                    }
                    return {
                        amount: new BigNumber(Infinity),
                        pool: srcPools[index]!
                    };
                })
                .sort((a, b) => (a.amount.gt(b.amount) ? 1 : -1));
        } catch (err) {
            if (err instanceof Error) {
                throw new RubicSdkError('Tokens are not supported.');
            }
            throw new RubicSdkError('Unknown error.');
        }
    }

    private async getPoolToken(
        poolId: number,
        fromBlockchain: EvmBlockchainName
    ): Promise<PriceToken> {
        const web3Adapter = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const poolAddress = await web3Adapter.callContractMethod(
            stargateContractAddress[fromBlockchain as StargateCrossChainSupportedBlockchain],
            stargateRouterAbi,
            'pool',
            [poolId]
        );

        const tokenAddress = await web3Adapter.callContractMethod(
            poolAddress,
            stargatePoolAbi,
            'token',
            []
        );

        return PriceToken.createToken({
            address: tokenAddress,
            blockchain: fromBlockchain
        });
    }

    private async calculateComplexRoute(
        _from: PriceTokenAmount<EvmBlockchainName>,
        _toToken: PriceToken<EvmBlockchainName>
    ): Promise<undefined> {
        // @TODO CCR
        // const poolsFee = await this.fetchMultiplePoolFees(from, toToken);
        // const bestSourcePool = poolsFee[0]!.pool;
        // const [transitTokenSymbol] = Object.entries(stargatePoolId).find(
        //     pool => pool[1] === bestSourcePool
        // )!;
        //
        return undefined;
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
        const onChainTrades = (
            await Promise.allSettled(
                dexes.map(dex =>
                    dex.calculate(from, to, {
                        slippageTolerance,
                        gasCalculation: 'disabled',
                        useProxy: false
                    })
                )
            )
        )
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            // .filter(onChainTrade =>
            //     availableDexes.some(availableDex =>
            //         compareAddresses(availableDex, onChainTrade.dexContractAddress)
            //     )
            // )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!onChainTrades.length) {
            return null;
        }
        return onChainTrades[0]!;
    }
}
