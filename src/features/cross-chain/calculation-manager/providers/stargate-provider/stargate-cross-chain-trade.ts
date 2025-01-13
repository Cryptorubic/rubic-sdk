import BigNumber from 'bignumber.js';
import { BytesLike } from 'ethers';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { relayersAddresses } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/relayers-addresses';
import {
    StargateBridgeToken,
    stargateBridgeToken
} from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { stargatePoolId } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-id';
import { stargatePoolsDecimals } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pools-decimals';
import { StargateCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/stargate-cross-chain-provider';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { evmCommonCrossChainAbi } from '../common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { stargateChainId } from './constants/stargate-chain-id';
import {
    stargateContractAddress,
    stargateEthContractAddress
} from './constants/stargate-contract-address';
import { StargateCrossChainSupportedBlockchain } from './constants/stargate-cross-chain-supported-blockchain';
import { stargateRouterAbi } from './constants/stargate-router-abi';
import { stargateRouterEthAbi } from './constants/stargate-router-eth-abi';

export class StargateCrossChainTrade extends EvmCrossChainTrade {
    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaStargate'
            : 'startBridgeTokensViaStargate';
    }

    public readonly feeInfo: FeeInfo;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    public readonly toTokenAmountMin: BigNumber;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.STARGATE;

    public get fromBlockchain(): StargateCrossChainSupportedBlockchain {
        return this.from.blockchain as StargateCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : stargateContractAddress[this.fromBlockchain];
    }

    private readonly onChainTrade: EvmOnChainTrade | null;

    private readonly dstChainTrade: EvmOnChainTrade | null;

    private readonly cryptoFeeToken: PriceToken | null;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            slippageTolerance: number;
            priceImpact: number | null;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            srcChainTrade: EvmOnChainTrade | null;
            dstChainTrade: EvmOnChainTrade | null;
            cryptoFeeToken: PriceToken | null;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.priceImpact = crossChainTrade.priceImpact;
        this.gasData = crossChainTrade.gasData;
        this.feeInfo = crossChainTrade.feeInfo;
        this.onChainTrade = crossChainTrade.srcChainTrade;
        this.dstChainTrade = crossChainTrade.dstChainTrade;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(
            1 -
                (crossChainTrade.srcChainTrade
                    ? this.slippageTolerance / 2
                    : this.slippageTolerance)
        );
        this.onChainSubtype = {
            from: this.onChainTrade?.type,
            to: this.dstChainTrade?.type
        };
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        checkUnsupportedReceiverAddress(options?.receiverAddress, this.walletAddress);
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const { data, to } = await StargateCrossChainTrade.getLayerZeroSwapData(
                this.from,
                this.to,
                Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
                options?.receiverAddress
            );

            const lzFeeWei = Web3Pure.toWei(
                this.feeInfo.provider!.cryptoFee!.amount,
                nativeTokensList[this.from.blockchain].decimals
            );

            const value = this.from.isNative
                ? this.from.weiAmount.plus(lzFeeWei).toFixed()
                : lzFeeWei;

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const fromToken = (
            this.onChainTrade ? this.onChainTrade.toTokenAmountMin : this.from
        ) as PriceTokenAmount<EvmBlockchainName>;

        const config = await StargateCrossChainTrade.getLayerZeroSwapData(
            fromToken,
            this.to,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            receiverAddress
        );

        return { config, amount: this.to.stringWeiAmount };
    }

    public static async getLayerZeroSwapData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        tokenAmountMin: string = to.stringWeiAmount,
        receiverAddress?: string,
        dstData?: string
    ): Promise<EvmEncodeConfig> {
        const walletAddress =
            Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address ||
            EvmWeb3Pure.EMPTY_ADDRESS;
        const fromBlockchain = from.blockchain as StargateCrossChainSupportedBlockchain;
        const toBlockchain = to.blockchain as StargateCrossChainSupportedBlockchain;
        const dstRelayer = relayersAddresses[toBlockchain];
        const destinationAddress = dstData ? dstRelayer : receiverAddress || walletAddress;
        const isEthTrade = from.isNative && to.isNative;
        const stargateRouterAddress = isEthTrade
            ? stargateEthContractAddress[fromBlockchain]!
            : stargateContractAddress[fromBlockchain];
        const dstChainId = stargateChainId[toBlockchain];
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

        let srcPoolId = stargatePoolId[fromSymbol as StargateBridgeToken];
        let dstPoolId = stargatePoolId[toSymbol as StargateBridgeToken];

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

        const dstConfig = dstData
            ? ['750000', '0', relayersAddresses[toBlockchain]]
            : ['0', '0', walletAddress];

        const methodArguments = isEthTrade
            ? [dstChainId, walletAddress, walletAddress, from.stringWeiAmount, tokenAmountMin]
            : [
                  dstChainId,
                  srcPoolId,
                  dstPoolId,
                  walletAddress,
                  from.stringWeiAmount,
                  tokenAmountMin,
                  dstConfig,
                  destinationAddress,
                  dstData || '0x'
              ];
        const methodName = isEthTrade ? 'swapETH' : 'swap';
        const abi = isEthTrade ? stargateRouterEthAbi : stargateRouterAbi;
        return EvmWeb3Pure.encodeMethodCall(
            stargateRouterAddress,
            abi,
            methodName,
            methodArguments
        );
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const { data } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: this.onChainTrade,
            providerAddress: this.providerAddress,
            type: `native:${this.type}`,
            fromAddress: this.walletAddress,
            dstChainTrade: this.dstChainTrade || undefined
        });
        const swapData =
            this.onChainTrade &&
            (await ProxyCrossChainEvmTrade.getSwapData(options, {
                walletAddress: this.walletAddress,
                contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
                fromTokenAmount: this.from,
                toTokenAmount: this.onChainTrade.to,
                onChainEncodeFn: this.onChainTrade.encode.bind(this.onChainTrade)
            }));

        const dstSwapConfiguration: string | undefined = undefined;
        // Uncomment when dst swap is ready
        // if (dstSwapData) {
        //     const txId = bridgeData[0];
        //     const reveivedToken = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
        //
        //     dstSwapConfiguration = EvmWeb3Pure.encodeParameters(
        //         ['bytes32', 'bytes', 'address', 'address'],
        //         [txId, dstSwapData, reveivedToken, options.receiverAddress || this.walletAddress]
        //     );
        // }

        const providerData = this.getProviderData(
            data,
            dstSwapConfiguration,
            options.receiverAddress
        );

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const lzWeiFee = Web3Pure.toWei(
            this.feeInfo.provider!.cryptoFee!.amount,
            nativeTokensList[this.from.blockchain].decimals
        );
        const totalValue = this.from.isNative
            ? this.from.weiAmount.plus(lzWeiFee).toFixed()
            : lzWeiFee;
        const value = this.getSwapValue(totalValue);

        const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            evmCommonCrossChainAbi,
            this.methodName,
            methodArguments,
            value
        );
        const sendingToken = this.from.isNative ? [] : [this.from.address];
        const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
            contractAbi: gatewayRubicCrossChainAbi,
            methodName: 'startViaRubic',
            methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
            value
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken?.price.multipliedBy(
            this.feeInfo.provider?.cryptoFee?.amount || 0
        );
        if (usdCryptoFee && usdCryptoFee.gt(0)) {
            return fromUsd
                .plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee)
                .dividedBy(this.to.tokenAmount);
        }

        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippageTolerance * 100,
            routePath: this.routePath
        };
    }

    private getProviderData(
        _sourceData: BytesLike,
        dstSwapData?: string,
        receiverAddress?: string
    ): unknown[] {
        const swapFromMetisBlockchain = this.fromBlockchain === BLOCKCHAIN_NAME.METIS;

        const toSymbol = StargateCrossChainProvider.getSymbol(
            this.to.symbol,
            this.to.blockchain,
            swapFromMetisBlockchain
        );
        const pool = stargatePoolId[toSymbol as StargateBridgeToken];
        const targetPoolDecimals =
            stargatePoolsDecimals[this.to.symbol as StargateBridgeToken] ||
            stargatePoolsDecimals[toSymbol as StargateBridgeToken];
        const amount = Web3Pure.toWei(this.toTokenAmountMin, targetPoolDecimals);
        const fee = Web3Pure.toWei(
            this.feeInfo.provider!.cryptoFee!.amount,
            nativeTokensList[this.from.blockchain].decimals
        );
        const destinationAddress = receiverAddress || this.walletAddress;

        return [
            pool,
            amount,
            dstSwapData ? '750000' : '0',
            fee,
            this.walletAddress,
            dstSwapData
                ? relayersAddresses[this.to.blockchain as StargateCrossChainSupportedBlockchain]
                : destinationAddress,
            dstSwapData || '0x'
        ];
    }
}
