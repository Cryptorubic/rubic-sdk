import BigNumber from 'bignumber.js';
import { BytesLike } from 'ethers';
import { nativeTokensList, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
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
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { RangoCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-cross-chain-supported-blockchain';
import { StargateBridgeToken } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-bridge-token';
import { stargatePoolId } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pool-id';
import { stargatePoolsDecimals } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-pools-decimals';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
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

    /**  @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as RangoCrossChainSupportedBlockchain;
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;

        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new StargateCrossChainTrade(
                    {
                        from,
                        to,
                        toTokenAmountMin: new BigNumber(0),
                        slippageTolerance: 4,
                        priceImpact: null,
                        gasData: {
                            gasLimit: new BigNumber(0),
                            gasPrice: new BigNumber(0)
                        },
                        feeInfo: {},
                        onChainTrade: null
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams({});

            const [gasLimit, gasPrice] = await Promise.all([
                web3Public.getEstimatedGas(
                    contractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                new BigNumber(await Injector.gasPriceApi.getGasPrice(fromBlockchain))
            ]);

            if (!gasLimit?.isFinite()) {
                return null;
            }

            const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);

            return {
                gasLimit: increasedGasLimit,
                gasPrice
            };
        } catch (_err) {
            return null;
        }
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
        return rubicProxyContractAddress[this.fromBlockchain].gateway;
    }

    private readonly onChainTrade: EvmOnChainTrade | null;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            toTokenAmountMin: BigNumber;
            slippageTolerance: number;
            priceImpact: number | null;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            onChainTrade: EvmOnChainTrade | null;
        },
        providerAddress: string
    ) {
        super(providerAddress);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.priceImpact = crossChainTrade.priceImpact;
        this.gasData = crossChainTrade.gasData;
        this.feeInfo = crossChainTrade.feeInfo;
        this.onChainTrade = crossChainTrade.onChainTrade;
        this.onChainSubtype = {
            from: this.onChainTrade?.type,
            to: undefined
        };
    }

    private async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        checkUnsupportedReceiverAddress(options?.receiverAddress, this.walletAddress);
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice } = options;
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
                this.toTokenAmountMin
            );

            const lzFeeWei = Web3Pure.toWei(
                this.feeInfo.provider!.cryptoFee!.amount,
                nativeTokensList[this.from.blockchain].decimals
            );

            const value = this.from.isNative
                ? this.from.weiAmount.plus(lzFeeWei).toFixed()
                : this.getSwapValue(lzFeeWei);

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
                gasPrice
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
        // return super.swap(options);
    }

    public static async getLayerZeroSwapData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        amountOutMin: BigNumber,
        receiverAddress?: string
    ): Promise<EvmEncodeConfig> {
        const walletAddress =
            Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM).address ||
            EvmWeb3Pure.EMPTY_ADDRESS;
        const destinationAddress = receiverAddress || walletAddress;
        const isEthTrade = from.isNative && to.isNative;
        const stargateRouterAddress = isEthTrade
            ? stargateEthContractAddress[from.blockchain as StargateCrossChainSupportedBlockchain]!
            : stargateContractAddress[from.blockchain as StargateCrossChainSupportedBlockchain];
        const dstChainId = stargateChainId[to.blockchain as StargateCrossChainSupportedBlockchain];

        const methodArguments = isEthTrade
            ? [dstChainId, walletAddress, walletAddress, from.stringWeiAmount, to.stringWeiAmount]
            : [
                  dstChainId,
                  stargatePoolId[from.symbol as StargateBridgeToken],
                  stargatePoolId[to.symbol as StargateBridgeToken],
                  walletAddress,
                  from.stringWeiAmount,
                  Web3Pure.toWei(
                      amountOutMin,
                      stargatePoolsDecimals[to.symbol as StargateBridgeToken]
                  ),
                  ['0', '0', walletAddress],
                  destinationAddress,
                  '0x'
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
        const lzTxConfig = await StargateCrossChainTrade.getLayerZeroSwapData(
            this.onChainTrade ? this.onChainTrade.to : this.from,
            this.to,
            this.toTokenAmountMin
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            onChainTrade: this.onChainTrade,
            providerAddress: this.providerAddress,
            type: this.type
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
        const providerData = this.getProviderData(lzTxConfig.data);

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

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };

        // const routerCallParams = [
        //     this.from.address,
        //     this.from.stringWeiAmount,
        //     blockchainId[this.to.blockchain],
        //     this.to.address,
        //     Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
        //     this.walletAddress,
        //     this.providerAddress,
        //     lzTxConfig.to
        // ];
        //
        // const methodArguments: unknown[] = [
        //     `${this.type.toLowerCase()}:${this.bridgeType}`,
        //     routerCallParams
        // ];
        //
        // if (!this.from.isNative && !this.to.isNative) {
        //     methodArguments.push(lzTxConfig.to);
        // }
        // methodArguments.push(lzTxConfig.data);
        //
        // const lzFeeWei = Web3Pure.toWei(
        //     this.feeInfo.provider?.cryptoFee?.amount!,
        //     nativeTokensList[this.from.blockchain].decimals
        // );
        // const fixedFeeWei = Web3Pure.toWei(
        //     this.feeInfo.rubicProxy?.fixedFee?.amount!,
        //     nativeTokensList[this.from.blockchain].decimals
        // );
        // const value = this.from.isNative
        //     ? this.from.weiAmount.plus(lzFeeWei).plus(fixedFeeWei).toString()
        //     : this.getSwapValue(lzFeeWei);
        //
        // console.log({
        //     lzFeeWei,
        //     RubicfixedFee: Web3Pure.toWei(
        //         this.feeInfo.rubicProxy?.fixedFee?.amount!,
        //         nativeTokensList[this.from.blockchain].decimals
        //     ),
        //     value
        // });
        // const value = this.getSwapValue(
        //     this.from.isNative
        //         ? this.from.weiAmount.plus(lzFeeWei).plus(fixedFeeWei).toString()
        //         : new BigNumber(fixedFeeWei).plus(lzFeeWei).toString()
        // );

        // return {
        //     contractAddress: this.fromContractAddress,
        //     contractAbi: evmCommonCrossChainAbi,
        //     methodName: this.methodName,
        //     methodArguments,
        //     value
        // };
    }

    public getTradeAmountRatio(_fromUsd: BigNumber): BigNumber {
        return new BigNumber(1);
    }

    public getUsdPrice(): BigNumber {
        return this.from.price.multipliedBy(this.from.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippageTolerance
        };
    }

    protected async checkProviderIsWhitelisted(
        _providerRouter: string,
        _providerGateway?: string
    ): Promise<void> {
        return undefined;
    }

    protected getProviderData(_sourceData: BytesLike): unknown[] {
        const pool = stargatePoolId[this.to.symbol as StargateBridgeToken];
        const targetPoolDecimals = stargatePoolsDecimals[this.to.symbol as StargateBridgeToken];
        const amount = Web3Pure.toWei(this.toTokenAmountMin, targetPoolDecimals);
        const fee = Web3Pure.toWei(
            this.feeInfo.provider!.cryptoFee!.amount,
            nativeTokensList[this.from.blockchain].decimals
        );

        return [pool, amount, '0', fee, this.walletAddress, this.walletAddress, '0x'];
    }
}
