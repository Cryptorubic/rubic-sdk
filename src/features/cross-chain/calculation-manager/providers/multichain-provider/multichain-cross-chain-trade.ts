import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
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
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { multichainContractAbi } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/constants/contract-abi';
import { MultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/multichain-method-name';
import { MultichainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/supported-blockchain';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class MultichainCrossChainTrade extends EvmCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.MULTICHAIN;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly bridgeType = BRIDGE_TYPE.MULTICHAIN;

    protected readonly routerAddress: string;

    private readonly spenderAddress: string;

    private readonly routerMethodName: MultichainMethodName;

    protected readonly anyTokenAddress: string;

    private readonly slippage: number;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount,
        routerAddress: string,
        spenderAddress: string,
        multichainMethodName: MultichainMethodName,
        anyTokenAddress: string,
        onChainTrade?: EvmOnChainTrade | null
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new MultichainCrossChainTrade(
                    {
                        from,
                        to,
                        gasData: null,
                        priceImpact: 0,
                        toTokenAmountMin: new BigNumber(0),
                        feeInfo: {},
                        routerAddress,
                        spenderAddress,
                        routerMethodName: multichainMethodName,
                        anyTokenAddress,
                        onChainTrade: onChainTrade!,
                        slippage: 0
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

    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaMultichain'
            : 'startBridgeTokensViaMultichain';
    }

    public readonly onChainSubtype: OnChainSubtype;

    public readonly onChainTrade: EvmOnChainTrade | null;

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[
            this.from.blockchain as MultichainCrossChainSupportedBlockchain
        ].gateway;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount;
            gasData: GasData;
            priceImpact: number;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            routerAddress: string;
            spenderAddress: string;
            routerMethodName: MultichainMethodName;
            anyTokenAddress: string;
            slippage: number;
            onChainTrade: EvmOnChainTrade | null;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.routerAddress = crossChainTrade.routerAddress;
        this.spenderAddress = crossChainTrade.spenderAddress;
        this.routerMethodName = crossChainTrade.routerMethodName;
        this.anyTokenAddress = crossChainTrade.anyTokenAddress;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;

        this.onChainSubtype = crossChainTrade.onChainTrade
            ? { from: crossChainTrade.onChainTrade?.type, to: undefined }
            : { from: undefined, to: undefined };
        this.onChainTrade = crossChainTrade.onChainTrade;
    }

    protected async swapDirect(options: SwapTransactionOptions): Promise<string> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice } = options;

        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const toChainId = blockchainId[this.to.blockchain];
            const receiverAddress = options?.receiverAddress || this.walletAddress;

            const fromAmountWithoutFee = getFromWithoutFee(
                this.from,
                this.feeInfo.rubicProxy?.platformFee?.percent
            ).stringWeiAmount;
            let multichainMethodArguments: unknown[];
            if (this.routerMethodName === 'anySwapOutNative') {
                multichainMethodArguments = [this.anyTokenAddress, receiverAddress, toChainId];
            } else {
                multichainMethodArguments = [
                    this.anyTokenAddress,
                    receiverAddress,
                    fromAmountWithoutFee,
                    toChainId
                ];
            }
            const value = this.getSwapValue();

            const receipt = await this.web3Private.tryExecuteContractMethod(
                this.routerAddress,
                multichainContractAbi,
                this.routerMethodName,
                multichainMethodArguments,
                {
                    value,
                    onTransactionHash,
                    gasPrice,
                    gas: gasLimit
                }
            );
            return receipt.blockHash;
        } catch (err) {
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: this.onChainTrade,
            providerAddress: this.providerAddress,
            type: this.type,
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
        //
        const providerData = [this.routerAddress];

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const value = this.getSwapValue();

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

    public getUsdPrice(): BigNumber {
        return this.from.price.multipliedBy(this.from.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100
        };
    }
}
