import BigNumber from 'bignumber.js';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { GasPriceBN } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { PulseChainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';
import { BridgeManager } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/bridge-manager';
import { OmniBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/omni-bridge';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { convertGasDataToBN } from '../../utils/convert-gas-price';

export class PulseChainCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        onChainTrade: EvmOnChainTrade | null,
        feeInfo: FeeInfo,
        toTokenAmountMin: BigNumber,
        providerAddress: string,
        receiverAddress: string,
        routerAddress: string,
        tokenRegistered: boolean
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as PulseChainCrossChainSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            let gasLimit: BigNumber | null;
            let gasDetails: GasPriceBN | BigNumber | null;
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

            if (feeInfo.rubicProxy?.fixedFee?.amount.gt(0)) {
                const { contractAddress, contractAbi, methodName, methodArguments, value } =
                    await new PulseChainCrossChainTrade(
                        {
                            from,
                            to: toToken,
                            gasData: null,
                            priceImpact: 0,
                            slippage: 0,
                            feeInfo: feeInfo!,
                            toTokenAmountMin,
                            onChainTrade: onChainTrade,
                            routerAddress,
                            tokenRegistered
                        },
                        providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                        []
                    ).getContractParams({});

                const [proxyGasLimit, proxyGasDetails] = await Promise.all([
                    web3Public.getEstimatedGas(
                        contractAbi,
                        contractAddress,
                        methodName,
                        methodArguments,
                        walletAddress,
                        value
                    ),
                    convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(from.blockchain))
                ]);

                gasLimit = proxyGasLimit;
                gasDetails = proxyGasDetails;
            } else {
                const { data, to, value } = new PulseChainCrossChainTrade(
                    {
                        from,
                        to: toToken,
                        gasData: null,
                        priceImpact: 0,
                        slippage: 0,
                        feeInfo: feeInfo,
                        toTokenAmountMin,
                        onChainTrade: onChainTrade,
                        routerAddress,
                        tokenRegistered
                    },
                    providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                    []
                ).getTransactionRequest(
                    receiverAddress,
                    onChainTrade ? onChainTrade.to : from,
                    toToken
                );

                const defaultGasLimit = await web3Public.getEstimatedGasByData(walletAddress, to, {
                    data,
                    value
                });
                const defaultGasDetails = convertGasDataToBN(
                    await Injector.gasPriceApi.getGasPrice(from.blockchain)
                );

                gasLimit = defaultGasLimit;
                gasDetails = defaultGasDetails;
            }

            if (!gasLimit?.isFinite()) {
                return null;
            }

            const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);
            return {
                gasLimit: increasedGasLimit,
                ...gasDetails
            };
        } catch (_err) {
            return null;
        }
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.PULSE_CHAIN_BRIDGE;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.PULSE_CHAIN_BRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    private readonly routerAddress: string;

    private get fromBlockchain(): PulseChainCrossChainSupportedBlockchain {
        return this.from.blockchain as PulseChainCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.routerAddress;
    }

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly onChainTrade: EvmOnChainTrade | null;

    protected get methodName(): string {
        if (this.isErc677 && this.from.blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            return this.onChainTrade
                ? 'swapAndStartBridgeViaTransferAndCall'
                : 'startBridgeViaTransferAndCall';
        }
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaGenericCrossChain'
            : 'startBridgeTokensViaGenericCrossChain';
    }

    private readonly isTokenRegistered: boolean;

    private get isErc677(): boolean {
        return !this.isTokenRegistered || OmniBridge.isCustomWrap(this.from);
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
            slippage: number;
            feeInfo: FeeInfo;
            toTokenAmountMin: BigNumber;
            onChainTrade: EvmOnChainTrade | null;
            priceImpact: number | null;
            routerAddress: string;
            tokenRegistered: boolean;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.slippage = crossChainTrade.slippage;
        this.toTokenAmountMin = Web3Pure.fromWei(
            crossChainTrade.toTokenAmountMin,
            crossChainTrade.to.decimals
        );
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = crossChainTrade.priceImpact;
        this.routerAddress = crossChainTrade.routerAddress;
        this.onChainSubtype = crossChainTrade.onChainTrade
            ? { from: crossChainTrade.onChainTrade.type, to: undefined }
            : { from: undefined, to: undefined };
        this.onChainTrade = crossChainTrade.onChainTrade;
        this.isTokenRegistered = crossChainTrade.tokenRegistered;
    }

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative || (this.isErc677 && !this.isProxyTrade)) {
            return false;
        }

        const allowance = await this.fromWeb3Public.getAllowance(
            this.from.address,
            this.walletAddress,
            this.fromContractAddress
        );
        return this.from.weiAmount.gt(allowance);
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();

        if (!this.isProxyTrade || this.isTokenRegistered) {
            await this.checkAllowanceAndApprove(options);
        }

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const { data, to, value } = this.getTransactionRequest(
                options.receiverAddress || this.walletAddress,
                this.from,
                this.to
            );

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
                gasPrice,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const {
            data,
            to,
            value: providerValue
        } = this.getTransactionRequest(
            receiverAddress,
            this.onChainTrade ? this.onChainTrade.to : this.from,
            this.to
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: this.onChainTrade,
            providerAddress: this.providerAddress,
            type: `native:${this.type}`,
            fromAddress: this.walletAddress
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

        const providerData = this.isErc677
            ? this.getProviderDataForErc677(receiverAddress, data)
            : await ProxyCrossChainEvmTrade.getGenericProviderData(
                  to,
                  data!,
                  this.fromBlockchain,
                  to,
                  '0'
              );

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const value = this.getSwapValue(providerValue);

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
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    private getTransactionRequest(
        receiverAddress: string,
        fromToken: PriceTokenAmount,
        toToken: Token
    ): EvmEncodeConfig {
        const sourceBridgeManager = BridgeManager.createBridge(
            fromToken as Token<PulseChainCrossChainSupportedBlockchain>,
            toToken as Token<PulseChainCrossChainSupportedBlockchain>
        );
        const tokenAddress = this.getTokenAddress(fromToken);

        if (fromToken.isNative) {
            return sourceBridgeManager.getDataForNativeSwap(
                receiverAddress,
                fromToken.stringWeiAmount
            );
        }

        return sourceBridgeManager.getDataForTokenSwap(
            receiverAddress,
            fromToken.stringWeiAmount,
            this.isErc677,
            tokenAddress
        );
    }

    private getTokenAddress(token: Token): string {
        if (token.blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            return token.isNative ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' : token.address;
        }
        return token.isNative ? '0xA1077a294dDE1B09bB078844df40758a5D0f9a27' : token.address;
    }

    private getProviderDataForErc677(receiverAddress: string, transferData: string): unknown[] {
        return [receiverAddress, transferData];
    }
}
