import BigNumber from 'bignumber.js';
import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { parseError } from 'src/common/utils/errors';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { feeLibraryAbi } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/fee-library-abi';
import { relayersAddresses } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/relayers-addresses';
import {
    StargateBridgeToken,
    stargateBridgeToken
} from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { stargateFactoryAbi } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-factory-abi';
import { stargateFeeLibraryContractAddress } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-fee-library-contract-address';
import { stargatePoolAbi } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-abi';
import { stargatePoolId } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-id';
import { stargatePoolMapping } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-mapping';
import { stargatePoolsDecimals } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pools-decimals';
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

    private static hasDirectRoute(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>
    ): boolean {
        const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = to.blockchain as StargateCrossChainSupportedBlockchain;
        const swapToMetisBlockchain = toBlockchain === BLOCKCHAIN_NAME.METIS;
        const swapFromMetisBlockchain = fromBlockchain === BLOCKCHAIN_NAME.METIS;
        const fromSymbol = StargateCrossChainProvider.getSymbol(
            from.symbol,
            fromBlockchain,
            swapToMetisBlockchain
        );
        const toSymbol = StargateCrossChainProvider.getSymbol(
            to.symbol,
            toBlockchain,
            swapFromMetisBlockchain
        );

        const srcPoolId = stargatePoolId[fromSymbol as StargateBridgeToken];
        const srcSupportedPools = stargateBlockchainSupportedPools[fromBlockchain];
        if (!srcPoolId || !srcSupportedPools.includes(srcPoolId)) {
            return false;
        }

        const dstPoolId = stargatePoolId[toSymbol as StargateBridgeToken];

        if (srcPoolId === dstPoolId && srcPoolId === 13) {
            return true;
        }
        const dstSupportedPools = stargateBlockchainSupportedPools[toBlockchain];
        if (!dstSupportedPools.includes(dstPoolId)) {
            throw new RubicSdkError('Tokens are not supported.');
        }

        const poolPathExists = stargatePoolMapping[fromBlockchain]?.[
            fromSymbol as StargateBridgeToken
        ]?.[toBlockchain]?.includes(toSymbol as StargateBridgeToken);

        return Boolean(poolPathExists);
    }

    // eslint-disable-next-line complexity
    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const from = new PriceTokenAmount({
            ...fromToken.asStruct,
            tokenAmount: fromToken.tokenAmount,
            address:
                fromToken.isNative && fromToken.blockchain === BLOCKCHAIN_NAME.METIS
                    ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
                    : fromToken.address
        });

        try {
            const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
            const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;
            const useProxy = options?.useProxy?.[this.type] ?? true;

            if (this.shouldWeStopCalculatingWithMetisToken(fromToken, toToken)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }

            if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }

            const wrongFantomUsdc = '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75';
            if (
                compareAddresses(from.address, wrongFantomUsdc) ||
                compareAddresses(toToken.address, wrongFantomUsdc)
            ) {
                throw new RubicSdkError('Trade to this tokens is not allowed');
            }

            const hasDirectRoute = StargateCrossChainProvider.hasDirectRoute(from, toToken);

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

            let transitTokenAmount = fromWithoutFee;
            let srcChainTrade: EvmOnChainTrade | null = null;
            let transitAmount: BigNumber = fromWithoutFee.tokenAmount;

            if (!hasDirectRoute || (useProxy && hasDirectRoute && from.isNative)) {
                if (!useProxy) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError(),
                        tradeType: this.type
                    };
                }
                const transitToken = await this.getTransitToken(hasDirectRoute, from, toToken);

                if (
                    fromToken.isNative &&
                    !transitToken.isWrapped &&
                    fromBlockchain !== BLOCKCHAIN_NAME.METIS
                ) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError(),
                        tradeType: this.type
                    };
                }

                const trade = await ProxyCrossChainEvmTrade.getOnChainTrade(
                    fromWithoutFee,
                    transitToken,
                    options.slippageTolerance / 2,
                    true
                );
                if (!trade) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError(),
                        tradeType: this.type
                    };
                }
                srcChainTrade = trade;
                transitTokenAmount = srcChainTrade.to;
                transitAmount = srcChainTrade.toTokenAmountMin.tokenAmount;
            }

            const poolFee = await this.fetchPoolFees(transitTokenAmount, toToken, transitAmount);
            const amountOutMin = transitAmount.minus(poolFee);
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: amountOutMin
            });

            const swapInDestination = false;
            const dstChainTrade = swapInDestination
                ? await this.getDstSwap(to, amountOutMin)
                : null;
            const dstSwapData = swapInDestination
                ? (
                      await dstChainTrade!.encodeDirect({
                          supportFee: false,
                          fromAddress: options?.fromAddress || EvmWeb3Pure.EMPTY_ADDRESS
                      })
                  ).data
                : undefined;

            const layerZeroFeeWei = await this.getLayerZeroFee(transitTokenAmount, to, dstSwapData);
            const layerZeroFeeAmount = Web3Pure.fromWei(
                layerZeroFeeWei,
                nativeTokensList[fromBlockchain].decimals
            );
            const nativeToken = await PriceToken.createFromToken(nativeTokensList[from.blockchain]);
            feeInfo.provider = {
                cryptoFee: {
                    amount: layerZeroFeeAmount,
                    token: nativeToken
                }
            };

            return {
                trade: new StargateCrossChainTrade(
                    {
                        from,
                        to,
                        slippageTolerance: options.slippageTolerance,
                        priceImpact: transitTokenAmount.calculatePriceImpactPercent(to),
                        gasData: await this.getGasData(from),
                        feeInfo,
                        srcChainTrade,
                        dstChainTrade,
                        cryptoFeeToken: nativeToken
                    },
                    options.providerAddress,
                    await this.getRoutePath(from, to, srcChainTrade),
                    useProxy
                ),
                tradeType: this.type
            };
        } catch (error) {
            console.error({ 'CALCULATE ERROR': error });
            return {
                trade: null,
                error: parseError(error),
                tradeType: this.type
            };
        }
    }

    private async getLayerZeroFee(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        dstSwapData?: string
    ): Promise<BigNumber> {
        const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = to.blockchain as StargateCrossChainSupportedBlockchain;
        const layerZeroTxData = await StargateCrossChainTrade.getLayerZeroSwapData(
            from,
            to,
            to.stringWeiAmount,
            undefined,
            dstSwapData
        );
        const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
        const walletAddress = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address;
        const dstConfig = dstSwapData
            ? ['750000', '0', relayersAddresses[toBlockchain]]
            : ['0', '0', walletAddress || EvmWeb3Pure.EMPTY_ADDRESS];
        const layerZeroFee = await web3Public.callContractMethod(
            stargateContractAddress[fromBlockchain],
            stargateRouterAbi,
            'quoteLayerZeroFee',
            [
                stargateChainId[toBlockchain],
                1,
                walletAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                layerZeroTxData.data,
                dstConfig
            ]
        );
        return new BigNumber(`${layerZeroFee['0']!}`);
    }

    protected async getFeeInfo(
        fromBlockchain: Partial<EvmBlockchainName>,
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

    private async fetchPoolFees(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        transitAmount: BigNumber
    ): Promise<BigNumber> {
        const fromBlockchain = fromToken.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;
        const swapToMetisBlockchain = toBlockchain === BLOCKCHAIN_NAME.METIS;
        const swapFromMetisBlockchain = fromBlockchain === BLOCKCHAIN_NAME.METIS;

        const fromSymbol = StargateCrossChainProvider.getSymbol(
            fromToken.symbol,
            fromBlockchain,
            swapToMetisBlockchain
        );
        const toSymbol = StargateCrossChainProvider.getSymbol(
            toToken.symbol,
            toBlockchain,
            swapFromMetisBlockchain
        );

        let srcPoolId = stargatePoolId[fromSymbol as StargateBridgeToken];
        let dstPoolId = stargatePoolId[toSymbol as StargateBridgeToken];
        const dstChainId = stargateChainId[toBlockchain as StargateCrossChainSupportedBlockchain];

        const sdDecimals = stargatePoolsDecimals[fromSymbol as StargateBridgeToken];
        const amountSD = Web3Pure.toWei(transitAmount, sdDecimals);

        // @TODO FIX STARGATE MULTIPLE POOLS
        if (
            dstPoolId === stargatePoolId[stargateBridgeToken.mUSD] &&
            srcPoolId === stargatePoolId[stargateBridgeToken.USDT]
        ) {
            srcPoolId = stargatePoolId[stargateBridgeToken.mUSD];
        }
        if (
            srcPoolId === stargatePoolId[stargateBridgeToken.mUSD] &&
            dstPoolId === stargatePoolId[stargateBridgeToken.USDT]
        ) {
            dstPoolId = stargatePoolId[stargateBridgeToken.mUSD];
        }

        try {
            const {
                1: eqFee,
                2: eqReward,
                4: protocolFee
            } = await Injector.web3PublicService
                .getWeb3Public(fromBlockchain)
                .callContractMethod<{ 1: string; 2: string; 4: string }>(
                    stargateFeeLibraryContractAddress[fromBlockchain],
                    feeLibraryAbi,
                    'getFees',
                    [srcPoolId, dstPoolId, dstChainId, EvmWeb3Pure.EMPTY_ADDRESS, amountSD]
                );

            return Web3Pure.fromWei(
                new BigNumber(eqFee).plus(protocolFee).minus(eqReward),
                sdDecimals
            );
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

        const factoryAddress = await web3Adapter.callContractMethod(
            stargateContractAddress[fromBlockchain as StargateCrossChainSupportedBlockchain],
            stargateRouterAbi,
            'factory',
            []
        );

        const poolAddress = await web3Adapter.callContractMethod(
            factoryAddress,
            stargateFactoryAbi,
            'getPool',
            [poolId]
        );

        if (compareAddresses(poolAddress, EvmWeb3Pure.EMPTY_ADDRESS)) {
            throw new RubicSdkError('No possible pool');
        }

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

    private async getTransitToken(
        hasDirectRoute: boolean,
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>
    ) {
        if (hasDirectRoute && !fromToken.isNative) {
            return fromToken;
        }

        const toBlockchain = toToken.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchainDirection = stargatePoolMapping[toBlockchain];
        const swapFromMetisBlockchain = fromToken.blockchain === BLOCKCHAIN_NAME.METIS;

        if (!toBlockchainDirection) {
            throw new RubicSdkError('Tokens are not supported.');
        }

        const toSymbol = StargateCrossChainProvider.getSymbol(
            toToken.symbol,
            toBlockchain,
            swapFromMetisBlockchain
        ) as StargateBridgeToken;

        const toSymbolDirection = toBlockchainDirection[toSymbol];
        if (!toSymbolDirection) {
            throw new RubicSdkError('Tokens are not supported.');
        }

        const fromBlockchain = fromToken.blockchain as StargateCrossChainSupportedBlockchain;
        const fromBlockchainDirection = toSymbolDirection[fromBlockchain];
        if (!fromBlockchainDirection) {
            throw new RubicSdkError('Tokens are not supported.');
        }

        const possibleTransitSymbol: StargateBridgeToken | undefined = Object.values(
            stargateBridgeToken
        ).find(symbol => symbol === toSymbol);
        if (!possibleTransitSymbol) {
            throw new RubicSdkError('Tokens are not supported.');
        }

        try {
            const poolToken = await this.getPoolToken(
                stargatePoolId[possibleTransitSymbol as unknown as StargateBridgeToken],
                fromBlockchain
            );
            return poolToken;
        } catch {
            const poolToken = await this.getPoolToken(
                stargatePoolId[fromBlockchainDirection[0] as unknown as StargateBridgeToken],
                fromBlockchain
            );
            return poolToken;
        }
    }

    private async getDstSwap(
        fromToken: PriceTokenAmount,
        tokenAmount: BigNumber
    ): Promise<EvmOnChainTrade | null> {
        return ProxyCrossChainEvmTrade.getOnChainTrade(
            new PriceTokenAmount({
                ...fromToken.asStruct,
                tokenAmount
            }),
            {
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
            },
            0.1
        );
    }

    public static getSymbol(
        symbol: string,
        blockchain: BlockchainName,
        swapWithMetisBlockchain?: boolean
    ): string {
        if (blockchain === BLOCKCHAIN_NAME.ARBITRUM && symbol === 'AETH') {
            return 'ETH';
        }

        if (
            swapWithMetisBlockchain &&
            (blockchain === BLOCKCHAIN_NAME.AVALANCHE ||
                blockchain === BLOCKCHAIN_NAME.ETHEREUM ||
                blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) &&
            symbol.toLowerCase() === 'usdt'
        ) {
            return 'm.USDT';
        }

        if (blockchain === BLOCKCHAIN_NAME.AVALANCHE && symbol === 'USDt') {
            return 'USDT';
        }
        if (blockchain === BLOCKCHAIN_NAME.FANTOM && symbol === 'USDC') {
            return 'FUSDC';
        }
        if (symbol.toUpperCase() === 'METIS') {
            return symbol.toUpperCase();
        }
        return symbol;
    }

    protected async getRoutePath(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        srcOnChainTrade: EvmOnChainTrade | null
    ): Promise<RubicStep[]> {
        if (srcOnChainTrade) {
            return [
                {
                    type: 'on-chain',
                    provider: srcOnChainTrade.type,
                    path: [srcOnChainTrade.from, srcOnChainTrade.to]
                },
                {
                    type: 'cross-chain',
                    provider: CROSS_CHAIN_TRADE_TYPE.STARGATE,
                    path: [srcOnChainTrade.to, to]
                }
            ];
        }

        return [
            {
                type: 'cross-chain',
                provider: CROSS_CHAIN_TRADE_TYPE.STARGATE,
                path: [from, to]
            }
        ];
    }

    // Не считаем трейды из Metis (metis/m.usdt) в Avalanche (metis) и в BNB chain (metis) и обратно
    private shouldWeStopCalculatingWithMetisToken(
        fromToken: PriceTokenAmount,
        toToken: PriceToken
    ): boolean {
        return (
            (fromToken.blockchain === BLOCKCHAIN_NAME.METIS &&
                fromToken.symbol.toLowerCase() !== 'metis' &&
                toToken.symbol.toLowerCase() === 'metis') ||
            (fromToken.blockchain === BLOCKCHAIN_NAME.METIS &&
                (toToken.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
                    toToken.blockchain === BLOCKCHAIN_NAME.AVALANCHE) &&
                toToken.symbol.toLowerCase() === 'metis') ||
            (toToken.blockchain === BLOCKCHAIN_NAME.METIS &&
                (fromToken.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
                    fromToken.blockchain === BLOCKCHAIN_NAME.AVALANCHE) &&
                fromToken.symbol.toLowerCase() === 'metis')
        );
    }
}
