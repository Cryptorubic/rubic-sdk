import BigNumber from 'bignumber.js';
import { BytesLike } from 'ethers';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { TokenStruct } from 'src/common/tokens/token';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { meteRouterAbi } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/mete-router-abi';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { SymbiosisCallDataDecode } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-call-data-decode';
import { SymbiosisTradeData } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { MethodDecoder } from 'src/features/cross-chain/calculation-manager/utils/decode-method';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

/**
 * Calculated Symbiosis cross-chain trade.
 */
export class SymbiosisCrossChainTrade extends EvmCrossChainTrade {
    private transitToken: TokenStruct;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount
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
                        swapFunction: () => new Promise(resolve => resolve),
                        gasData: null,
                        priceImpact: 0,
                        slippage: 0,
                        feeInfo: {},
                        transitAmount: new BigNumber(NaN),
                        onChainTrade: null,
                        transitToken: {
                            address: EvmWeb3Pure.EMPTY_ADDRESS,
                            blockchain: BLOCKCHAIN_NAME.POLYGON,
                            name: 'test',
                            symbol: 'test',
                            decimals: 18
                        }
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams({});

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasPrice] = await Promise.all([
                web3Public.getEstimatedGas(
                    contractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                new BigNumber(await Injector.gasPriceApi.getGasPrice(from.blockchain))
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
    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private readonly slippage: number;

    private readonly onChainTrade: EvmOnChainTrade | null;

    private readonly getTransactionRequest: (
        fromAddress: string,
        receiver?: string
    ) => Promise<SymbiosisTradeData>;

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.fromBlockchain].gateway;
    }

    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaSymbiosis'
            : 'startBridgeTokensViaSymbiosis';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount;
            swapFunction: (fromAddress: string, receiver?: string) => Promise<SymbiosisTradeData>;
            gasData: GasData | null;
            priceImpact: number;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
            onChainTrade: EvmOnChainTrade | null;
            transitToken: TokenStruct;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.getTransactionRequest = crossChainTrade.swapFunction;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;
        this.transitAmount = crossChainTrade.transitAmount;
        this.onChainTrade = crossChainTrade?.onChainTrade || null;
        this.onChainSubtype = {
            from: ON_CHAIN_TRADE_TYPE.ONE_INCH,
            to:
                crossChainTrade.to.blockchain === BLOCKCHAIN_NAME.BITCOIN
                    ? ON_CHAIN_TRADE_TYPE.REN_BTC
                    : ON_CHAIN_TRADE_TYPE.ONE_INCH
        };
        this.transitToken = crossChainTrade.transitToken;
    }

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const exactIn = await this.getTransactionRequest(
            this.walletAddress,
            options?.receiverAddress
        );
        const { data, value: providerValue } = exactIn.transactionRequest;

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
        const providerData = this.getProviderData(data!);

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const value = this.getSwapValue(providerValue?.toString());

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    /**
     * Used for direct provider swaps.
     * @param options Swap options
     */
    private async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );

        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            const { transactionRequest } = await this.getTransactionRequest(
                this.walletAddress,
                options?.receiverAddress
            );

            await this.web3Private.trySendTransaction(transactionRequest.to!, {
                data: transactionRequest.data!.toString(),
                value: transactionRequest.value?.toString() || '0',
                onTransactionHash,
                gas: gasLimit,
                gasPrice
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

    public getUsdPrice(): BigNumber {
        return this.transitAmount;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100
        };
    }

    private decodeCallData(data: ArrayLike<number> | string | undefined): {
        data: string;
        relay: string;
    } {
        if (typeof data === 'string') {
            const decodeData = MethodDecoder.decodeMethod(
                meteRouterAbi.find(method => method.name === 'metaRoute')!,
                data
            )!.params[0]!.value as unknown as SymbiosisCallDataDecode;
            return { data: decodeData.otherSideCalldata, relay: decodeData.relayRecipient };
        }
        throw new RubicSdkError('Wrong call data');
    }

    protected getProviderData(sourceData: BytesLike): unknown[] {
        const { data, relay } = this.decodeCallData(sourceData);

        return [
            '0x',
            '0x',
            EvmWeb3Pure.EMPTY_ADDRESS,
            this.from.address,
            EvmWeb3Pure.EMPTY_ADDRESS,
            EvmWeb3Pure.EMPTY_ADDRESS,
            relay,
            data
        ];
    }
}
