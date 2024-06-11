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
import { SeiWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/sei-web3-public/sei-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { SymbiosisApiService } from 'src/features/common/providers/symbiosis/services/symbiosis-api-service';
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
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';
import { SymbiosisTradeType } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { getCrossChainGasData } from 'src/features/cross-chain/calculation-manager/utils/get-cross-chain-gas-data';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { SymbiosisCrossChainSupportedBlockchain } from './models/symbiosis-cross-chain-supported-blockchains';

/**
 * Calculated Symbiosis cross-chain trade.
 */
export class SymbiosisCrossChainTrade extends EvmCrossChainTrade {
    private readonly swappingParams: SymbiosisSwappingParams;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount,
        swapParams: SymbiosisSwappingParams,
        feeInfo: FeeInfo,
        providerGateway: string,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const trade = new SymbiosisCrossChainTrade(
            {
                from,
                to: toToken,
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
            providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            []
        );
        return getCrossChainGasData(trade, receiverAddress);
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

    private get seiWeb3Public(): SeiWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SEI);
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
            promotions?: string[];
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
        this.promotions = crossChainTrade?.promotions || super.promotions;
    }

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );

        let receiverAddress = options.receiverAddress;
        let toAddress = '';
        const isLinkedAddress = await this.seiWeb3Public.isLinkedAddress(
            this.walletAddress,
            this.from.address
        );
        if (this.from.blockchain === BLOCKCHAIN_NAME.SEI && !isLinkedAddress) {
            console.log('Not a linked Address');
        }
        if (this.to.blockchain === BLOCKCHAIN_NAME.TRON) {
            const tronHexReceiverAddress = await this.tronWeb3Public.convertTronAddressToHex(
                options.receiverAddress!
            );
            receiverAddress = `0x${tronHexReceiverAddress.slice(2)}`;

            const toTokenTronAddress = await this.tronWeb3Public.convertTronAddressToHex(
                this.to.address
            );
            toAddress = `0x${toTokenTronAddress.slice(2)}`;
        }

        if (this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS) {
            toAddress = '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000';
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

        const { onConfirm, gasLimit, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            const { data, value, to } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options?.receiverAddress
            );

            await this.evmWeb3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
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

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const walletAddress = this.walletAddress;
        const params: SymbiosisSwappingParams = {
            ...this.swappingParams,
            from: walletAddress,
            to: receiverAddress || walletAddress,
            revertableAddress: this.getRevertableAddress(
                receiverAddress,
                walletAddress,
                this.to.blockchain
            )
        };

        const tradeData = await SymbiosisApiService.getCrossChainSwapTx(params);

        const config = {
            data: tradeData.tx.data!.toString(),
            value: tradeData.tx.value?.toString() || '0',
            to: tradeData.tx.to!
        };

        return { config, amount: tradeData.tokenAmountOut.amount };
    }

    private getRevertableAddress(
        receiverAddress: string | undefined,
        walletAddress: string,
        toBlockchain: BlockchainName
    ): string {
        if (toBlockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return walletAddress;
        }

        return receiverAddress || walletAddress;
    }
}
