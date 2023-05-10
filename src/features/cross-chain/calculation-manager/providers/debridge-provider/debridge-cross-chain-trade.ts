import BigNumber from 'bignumber.js';
import { BytesLike } from 'ethers';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { DE_BRIDGE_CONTRACT_ADDRESS } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/contract-address';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { TransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';
import { meteRouterAbi } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/mete-router-abi';
import { getSymbiosisV2Config } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-v2-config';
import { MethodDecoder } from 'src/features/cross-chain/calculation-manager/utils/decode-method';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class DebridgeCrossChainTrade extends EvmCrossChainTrade {
    protected useProxyByDefault = false;

    /** @internal */
    public readonly transitAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly transactionRequest: TransactionRequest;

    private readonly slippage: number;

    private readonly onChainTrade: EvmOnChainTrade | null;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        transactionRequest: TransactionRequest
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as DeBridgeCrossChainSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new DebridgeCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest,
                        gasData: null,
                        priceImpact: 0,
                        slippage: 0,
                        feeInfo: {},
                        transitAmount: new BigNumber(NaN),
                        cryptoFeeToken: from,
                        onChainTrade: null
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public readonly isAggregator = false;

    public readonly onChainSubtype = {
        from: ON_CHAIN_TRADE_TYPE.ONE_INCH,
        to: ON_CHAIN_TRADE_TYPE.ONE_INCH
    };

    public readonly bridgeType = BRIDGE_TYPE.DEBRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): DeBridgeCrossChainSupportedBlockchain {
        return this.from.blockchain as DeBridgeCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return DE_BRIDGE_CONTRACT_ADDRESS[this.fromBlockchain].providerGateway;
    }

    public readonly feeInfo: FeeInfo;

    protected get methodName(): string {
        return '';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            transactionRequest: TransactionRequest;
            gasData: GasData | null;
            priceImpact: number | null;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
            cryptoFeeToken: PriceTokenAmount;
            onChainTrade: EvmOnChainTrade | null;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.transactionRequest = crossChainTrade.transactionRequest;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;
        this.onChainTrade = crossChainTrade.onChainTrade;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.transitAmount = crossChainTrade.transitAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        const { data, value, to } = await this.getTransactionRequest(options?.receiverAddress);
        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };
        try {
            await this.web3Private.trySendTransaction(to, {
                onTransactionHash,
                data,
                value,
                gas: options.gasLimit,
                gasPrice: options.gasPrice
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw parseError(err);
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const { data, value: providerValue } = await this.getTransactionRequest(
            options?.receiverAddress
        );

        const bridgeData = this.getBridgeData(options);
        const swapData = this.onChainTrade && (await this.getSwapData(options));
        const providerData = this.getProviderData(data!);

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];
        const methodName = swapData
            ? 'swapAndStartBridgeTokensViaDeBridge'
            : 'startBridgeTokensViaDeBridge';

        const value = this.getSwapValue(providerValue);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: evmCommonCrossChainAbi,
            methodName,
            methodArguments,
            value
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee).dividedBy(this.to.tokenAmount);
    }

    private async getTransactionRequest(receiverAddress?: string): Promise<{
        data: string;
        value: string;
        to: string;
    }> {
        const params = {
            ...this.transactionRequest,
            ...(receiverAddress && { dstChainTokenOutRecipient: receiverAddress })
        };

        const { tx } = await Injector.httpClient.get<TransactionResponse>(
            DebridgeCrossChainProvider.apiEndpoint,
            { params }
        );
        return tx;
    }

    public getUsdPrice(): BigNumber {
        return this.transitAmount;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100
        };
    }

    protected getBridgeData(options: GetContractParamsOptions): unknown[] {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const toChainId = blockchainId[this.to.blockchain];
        const fromToken = this.onChainTrade ? this.onChainTrade.to : this.from;
        const hasSwapBeforeBridge = this.onChainTrade !== null;

        return [
            EvmWeb3Pure.randomHex(32),
            `native:${this.type.toLowerCase()}`,
            this.providerAddress,
            EvmWeb3Pure.randomHex(20),
            fromToken.address,
            receiverAddress,
            fromToken.stringWeiAmount,
            toChainId,
            hasSwapBeforeBridge,
            false
        ];
    }

    protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
        const fromAddress =
            options.fromAddress || this.walletAddress || oneinchApiParams.nativeAddress;
        const swapData = await this.onChainTrade!.encode({
            fromAddress,
            receiverAddress: this.fromContractAddress
        });

        return [
            [
                swapData.to,
                swapData.to,
                this.from.address,
                this.onChainTrade!.to.address,
                this.from.stringWeiAmount,
                swapData.data,
                true
            ]
        ];
    }

    protected getProviderData(sourceData: BytesLike): unknown[] {
        const targetCallData = this.decodeCallData(sourceData);
        const fromChainId = blockchainId[this.from.blockchain];
        const portalAddress = getSymbiosisV2Config().chains.find(
            chain => chain.id === fromChainId
        )!.portal;

        return [
            '0x',
            '0x',
            EvmWeb3Pure.EMPTY_ADDRESS,
            this.from.address,
            EvmWeb3Pure.EMPTY_ADDRESS,
            EvmWeb3Pure.EMPTY_ADDRESS,
            portalAddress,
            targetCallData
        ];
    }

    private decodeCallData(data: ArrayLike<number> | string | undefined): string {
        if (typeof data === 'string') {
            const decodeData = MethodDecoder.decodeMethod(
                meteRouterAbi.find(method => method.name === 'metaRoute')!,
                data
            )!.params[0]!.value as unknown as { otherSideCalldata: string };
            return decodeData.otherSideCalldata;
        }
        throw new RubicSdkError('Wrong call data');
    }
}
