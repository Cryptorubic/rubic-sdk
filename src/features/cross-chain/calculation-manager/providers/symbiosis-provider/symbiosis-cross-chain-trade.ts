import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
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
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import {
    SymbiosisTradeData,
    SymbiosisTradeType
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { convertGasDataToBN } from '../../utils/convert-gas-price';

/**
 * Calculated Symbiosis cross-chain trade.
 */
export class SymbiosisCrossChainTrade extends EvmCrossChainTrade {
    public static readonly symbiosisApi = 'https://api-v2.symbiosis.finance/crosschain/v1';

    private readonly swappingParams: SymbiosisSwappingParams;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount,
        swapParams: SymbiosisSwappingParams,
        feeInfo: FeeInfo,
        providerGateway: string
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new SymbiosisCrossChainTrade(
                    {
                        from,
                        to,
                        gasData: null,
                        priceImpact: 0,
                        slippage: 0,
                        feeInfo,
                        transitAmount: new BigNumber(NaN),
                        tradeType: { in: undefined, out: undefined },
                        contractAddresses: {
                            providerRouter: '',
                            providerGateway: providerGateway
                        },
                        swapParams
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS,
                    []
                ).getContractParams({}, true);

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasDetails] = await Promise.all([
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.SYMBIOSIS;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly feeInfo: FeeInfo;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    private readonly slippage: number;

    private readonly contractAddresses: { providerRouter: string; providerGateway: string };

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.contractAddresses.providerGateway;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    private get tronWeb3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TRON);
    }

    protected get evmWeb3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3Private('EVM');
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount;
            gasData: GasData | null;
            priceImpact: number | null;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
            tradeType: { in?: SymbiosisTradeType; out?: SymbiosisTradeType };
            contractAddresses: { providerRouter: string; providerGateway: string };
            swapParams: SymbiosisSwappingParams;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.swappingParams = crossChainTrade.swapParams;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.transitAmount = crossChainTrade.transitAmount;
        this.onChainSubtype = SymbiosisCrossChainTrade.getSubtype(
            crossChainTrade.tradeType,
            crossChainTrade.to.blockchain
        );
        this.contractAddresses = crossChainTrade.contractAddresses;
    }

    protected async getContractParams(
        options: GetContractParamsOptions,
        skipAmountChangeCheck: boolean = false
    ): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.getTransactionRequest(
            this.walletAddress,
            options?.receiverAddress,
            null,
            skipAmountChangeCheck
        );

        let receiverAddress = options.receiverAddress;
        let toAddress = '';

        if (this.to.blockchain === BLOCKCHAIN_NAME.TRON) {
            receiverAddress = await this.tronWeb3Public.convertTronAddressToHex(
                options.receiverAddress!
            );
            receiverAddress = `0x${receiverAddress.slice(2)}`;
            toAddress = await this.tronWeb3Public.convertTronAddressToHex(this.to.address);
            toAddress = `0x${toAddress.slice(2)}`;
        }

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
            { ...options, receiverAddress },
            {
                walletAddress: this.walletAddress,
                fromTokenAmount: this.from,
                toTokenAmount: this.to,
                toAddress,
                srcChainTrade: null,
                providerAddress: this.providerAddress,
                type: `native:${this.type}`,
                fromAddress: this.walletAddress
            }
        );
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            to!,
            data! as string,
            this.fromBlockchain as EvmBlockchainName,
            this.contractAddresses.providerGateway,
            '0'
        );

        const methodArguments = [bridgeData, providerData];

        const value = this.getSwapValue(
            this.from.isNative ? this.from.stringWeiAmount : providerValue?.toString()
        );

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

    /**
     * Used for direct provider swaps.
     * @param options Swap options
     */
    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );

        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            const { data, value, to } = await this.getTransactionRequest(
                this.walletAddress,
                options?.receiverAddress
            );

            await this.evmWeb3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
                gasPrice,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
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

    private static getSubtype(
        tradeType: {
            in?: SymbiosisTradeType;
            out?: SymbiosisTradeType;
        },
        toBlockchain: BlockchainName
    ): OnChainSubtype {
        const mapping: Record<SymbiosisTradeType | 'default', OnChainTradeType | undefined> = {
            dex: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
            '1inch': ON_CHAIN_TRADE_TYPE.ONE_INCH,
            'open-ocean': ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
            wrap: ON_CHAIN_TRADE_TYPE.WRAPPED,
            izumi: ON_CHAIN_TRADE_TYPE.IZUMI,
            default: undefined
        };
        return {
            from: mapping?.[tradeType?.in || 'default'],
            to:
                toBlockchain === BLOCKCHAIN_NAME.BITCOIN
                    ? ON_CHAIN_TRADE_TYPE.REN_BTC
                    : mapping?.[tradeType?.out || 'default']
        };
    }

    private async getTransactionRequest(
        walletAddress: string,
        receiverAddress?: string,
        transactionConfig?: EvmEncodeConfig | null,
        skipAmountChangeCheck: boolean = false
    ): Promise<EvmEncodeConfig> {
        if (transactionConfig) {
            return {
                data: transactionConfig.data,
                value: transactionConfig.value,
                to: transactionConfig.to
            };
        }
        const tradeData = await Injector.httpClient.post<SymbiosisTradeData>(
            `${SymbiosisCrossChainTrade.symbiosisApi}/swapping/exact_in?partnerId=rubic`,
            {
                ...this.swappingParams,
                from: walletAddress,
                to: walletAddress,
                revertableAddress: receiverAddress || walletAddress
            } as SymbiosisSwappingParams
        );
        const config = {
            data: tradeData.tx.data!.toString(),
            value: tradeData.tx.value?.toString() || '0',
            to: tradeData.tx.to!
        };
        if (!skipAmountChangeCheck) {
            EvmCrossChainTrade.checkAmountChange(
                config,
                tradeData.tokenAmountOut.amount,
                this.to.stringWeiAmount
            );
        }
        return config;
    }
}
