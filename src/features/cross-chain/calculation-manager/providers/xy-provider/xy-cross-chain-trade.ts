import BigNumber from 'bignumber.js';
import { BytesLike } from 'ethers';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
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
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { XyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-supported-blockchains';
import { XyTransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-transaction-request';
import { XyTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-transaction-response';
import { XyCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-provider';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

/**
 * Calculated XY cross-chain trade.
 */
export class XyCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        transactionRequest: XyTransactionRequest
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as XyCrossChainSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new XyCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest,
                        gasData: null,
                        priceImpact: 0,
                        slippage: 0,
                        feeInfo: {},
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

    public static readonly nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.XY;

    public readonly isAggregator = false;

    public readonly onChainSubtype = {
        from: undefined,
        to: undefined
    };

    public readonly bridgeType = BRIDGE_TYPE.XY;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private readonly transactionRequest: XyTransactionRequest;

    private get fromBlockchain(): XyCrossChainSupportedBlockchain {
        return this.from.blockchain as XyCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.fromBlockchain];
    }

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    protected get methodName(): string {
        return this.onChainTrade ? 'swapAndStartBridgeTokensViaXY' : 'startBridgeTokensViaXY';
    }

    private readonly onChainTrade: EvmOnChainTrade | null;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            transactionRequest: XyTransactionRequest;
            gasData: GasData | null;
            priceImpact: number;
            slippage: number;
            feeInfo: FeeInfo;
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
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = crossChainTrade.priceImpact;
        this.onChainTrade = crossChainTrade.onChainTrade;
    }

    public async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
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
            const { data, value, to } = await this.getTransactionRequest(options?.receiverAddress);

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
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const { data, value: providerValue } = await this.getTransactionRequest(receiverAddress);

        const bridgeData = this.getBridgeData(options);
        const swapData = this.onChainTrade && (await this.getSwapData(options));
        const providerData = this.getProviderData(data!);

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const value = this.getSwapValue(providerValue?.toString());

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    private async getTransactionRequest(receiverAddress?: string): Promise<{
        data: string;
        value: string;
        to: string;
    }> {
        const params: XyTransactionRequest = {
            ...this.transactionRequest,
            ...(receiverAddress && { receiveAddress: receiverAddress })
        };

        const { tx } = await Injector.httpClient.get<XyTransactionResponse>(
            `${XyCrossChainProvider.apiEndpoint}/swap`,
            { params: { ...params } }
        );
        return tx!;
    }

    public getUsdPrice(): BigNumber {
        return this.from.price.multipliedBy(this.from.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippage * 100
        };
    }

    protected getBridgeData(options: GetContractParamsOptions): unknown[] {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const toChainId = blockchainId[this.to.blockchain];
        const fromToken = this.onChainTrade ? this.onChainTrade.toTokenAmountMin : this.from;
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

    protected getProviderData(_sourceData: BytesLike): unknown[] {
        return [
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            this.slippage * 10_000
        ];
    }
}
