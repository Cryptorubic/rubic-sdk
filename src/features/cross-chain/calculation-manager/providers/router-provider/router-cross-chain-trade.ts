import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { RouterQuoteResponseConfig } from 'src/features/common/providers/router/models/router-quote-response-config';
import { RouterApiService } from 'src/features/common/providers/router/services/router-api-service';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { RouterCrossChainSupportedBlockchains } from './constants/router-cross-chain-supported-chains';
import { RouterCrossChainUtilService } from './utils/router-cross-chain-util-service.ts';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

export class RouterCrossChainTrade extends EvmCrossChainTrade {
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        providerAddress: string,
        routerQuoteConfig: RouterQuoteResponseConfig,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const trade = new RouterCrossChainTrade(
            {
                from,
                to,
                feeInfo,
                gasData: null,
                priceImpact: 0,
                routerQuoteConfig,
                slippage: 0
            },
            providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            []
        );
        return getCrossChainGasData(trade, receiverAddress);
    }

    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ROUTER;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    public readonly isAggregator = false;

    private readonly routerQuoteConfig: RouterQuoteResponseConfig;

    private get fromBlockchain(): RouterCrossChainSupportedBlockchains {
        return this.from.blockchain as RouterCrossChainSupportedBlockchains;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.routerQuoteConfig.allowanceTo;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            feeInfo: FeeInfo;
            gasData: GasData | null;
            priceImpact: number | null;
            routerQuoteConfig: RouterQuoteResponseConfig;
            slippage: number;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.routerQuoteConfig = crossChainTrade.routerQuoteConfig;
        this.slippage = crossChainTrade.slippage;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - this.slippage);
    }

    protected async getContractParams(
        options: GetContractParamsOptions,
        skipAmountChangeCheck?: boolean | undefined
    ): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to,
            gasPrice
        } = await this.setTransactionConfig(
            skipAmountChangeCheck || false,
            options?.useCacheData || false,
            options?.receiverAddress
        );
        try {
            const isEvmDestination = BlockchainsInfo.isEvmBlockchainName(this.to.blockchain);
            const receivingAsset = isEvmDestination ? this.to.address : this.from.address;
            const toBlockchain = this.to.blockchain as RouterCrossChainSupportedBlockchains;
            let receiverAddress = '';
            if (!isEvmDestination && options.receiverAddress) {
                receiverAddress = await RouterCrossChainUtilService.checkAndConvertAddress(
                    toBlockchain,
                    options?.receiverAddress
                );
            } else {
                receiverAddress = options?.receiverAddress || this.walletAddress;
            }

            const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
                {
                    ...options,
                    receiverAddress
                },
                {
                    walletAddress: this.walletAddress,
                    fromTokenAmount: this.from,
                    toTokenAmount: this.to,
                    srcChainTrade: null,
                    providerAddress: this.providerAddress,
                    type: `native:${this.type}`,
                    fromAddress: this.walletAddress,
                    toAddress: receivingAsset
                }
            );
            const extraNativeFee = this.from.isNative
                ? new BigNumber(providerValue).minus(this.from.stringWeiAmount).toFixed()
                : new BigNumber(providerValue).toFixed();
            const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
                to!,
                data! as string,
                this.fromBlockchain as EvmBlockchainName,
                to,
                extraNativeFee
            );

            const methodArguments = [bridgeData, providerData];

            const value = this.getSwapValue(providerValue);

            const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
                rubicProxyContractAddress[this.from.blockchain].router,
                evmCommonCrossChainAbi,
                this.methodName,
                methodArguments,
                value,
                {
                    gasPrice,
                }
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
        } catch (err) {
            console.log(err?.message);
            throw new RubicSdkError(err?.message);
        }
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const toBlockchain = this.to.blockchain as RouterCrossChainSupportedBlockchains;

        const toAddress = await RouterCrossChainUtilService.checkAndConvertAddress(
            toBlockchain,
            receiverAddress || this.walletAddress,
            this.to.address
        );
        const { txn, destination } = await RouterApiService.getSwapTx({
            ...this.routerQuoteConfig,
            senderAddress: this.walletAddress,
            receiverAddress: toAddress,
            refundAddress: this.walletAddress
        });

        if (!txn) {
            throw new RubicSdkError();
        }

        const config = {
            data: txn.data,
            value: txn.value,
            to: txn.to,
            gasPrice: txn.gasPrice,
        };

        return { config, amount: destination.tokenAmount };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
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
        gasPriceOptions
        try {
            const config = await this.setTransactionConfig(
                false,
                options.useCacheData || false,
                options?.receiverAddress
            );
            if ('data' in config) {
                const { data, value, to, gasPrice } = config;
                await this.web3Private.trySendTransaction(to, {
                    data,
                    value,
                    onTransactionHash,
                    gasPriceOptions: {
                        ...gasPriceOptions,
                        gasPrice
                    },
                    gasLimitRatio: this.gasLimitRatio,

                });
                return transactionHash!;
            }

            throw new Error('Invalid transaction config');
        } catch (err) {
            throw err;
        }
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );
        const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

        const fromAddress = this.walletAddress;

        const { data, value, to, gasPrice } = await this.encode({ ...options, fromAddress });

        const { onConfirm, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private[method](to, {
                data,
                value,
                onTransactionHash,
                gasPriceOptions: {
                    ...gasPriceOptions,
                    gasPrice
                },
                gasLimitRatio: this.gasLimitRatio,
                ...(options?.useEip155 && {
                    chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
                })
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }
}
