import BigNumber from 'bignumber.js';
import { EvmTransaction, RangoClient } from 'rango-sdk-basic/lib';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { RANGO_CONTRACT_ADDRESSES } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/contract-address';
import { RANGO_API_KEY } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-api-key';
import { RANGO_BLOCKCHAIN_NAME } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-blockchain-name';
import { RangoCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-cross-chain-supported-blockchain';
import { RangoBridgeTypes } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/models/rango-bridge-types';

export class RangoCrossChainTrade extends EvmCrossChainTrade {
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
                await new RangoCrossChainTrade(
                    {
                        from,
                        to,
                        toTokenAmountMin: new BigNumber(0),
                        slippageTolerance: 4,
                        cryptoFeeToken: {} as PriceTokenAmount,
                        feeInfo: {},
                        onChainSubtype: {
                            from: undefined,
                            to: undefined
                        },
                        bridgeType: BRIDGE_TYPE.RANGO,
                        priceImpact: null,
                        gasData: {
                            gasLimit: new BigNumber(0),
                            gasPrice: new BigNumber(0)
                        },
                        allowedSwappers: undefined
                    },
                    new RangoClient(RANGO_API_KEY),
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams();

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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly isAggregator = true;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    public readonly toTokenAmountMin: BigNumber;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType: BridgeType;

    public readonly rangoClientRef: RangoClient;

    public requestId: string | undefined;

    public readonly cryptoFeeToken: PriceTokenAmount;

    private readonly allowedSwappers: RangoBridgeTypes[] | undefined;

    public get fromBlockchain(): RangoCrossChainSupportedBlockchain {
        return this.from.blockchain as RangoCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return RANGO_CONTRACT_ADDRESSES[this.fromBlockchain].rubicRouter;
    }

    protected get methodName(): string {
        return '';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            toTokenAmountMin: BigNumber;
            slippageTolerance: number;
            feeInfo: FeeInfo;
            onChainSubtype: OnChainSubtype;
            bridgeType: BridgeType;
            priceImpact: number | null;
            cryptoFeeToken: PriceTokenAmount;
            gasData: GasData | null;
            allowedSwappers: RangoBridgeTypes[] | undefined;
        },
        rangoClientRef: RangoClient,
        providerAddress: string
    ) {
        super(providerAddress);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.priceImpact = crossChainTrade.priceImpact;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.gasData = crossChainTrade.gasData;
        this.allowedSwappers = crossChainTrade.allowedSwappers;

        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.bridgeType = crossChainTrade.bridgeType;

        this.rangoClientRef = rangoClientRef;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        checkUnsupportedReceiverAddress(options?.receiverAddress, this.walletAddress);

        return super.swap(options);
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        return super.swap(options);
    }

    public async getContractParams(): Promise<ContractParams> {
        const { txData, value: providerValue, txTo } = await this.refetchTxData();

        await this.checkProviderIsWhitelisted(txTo);

        const routerCallParams = [
            this.from.address,
            this.from.stringWeiAmount,
            blockchainId[this.to.blockchain],
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            this.walletAddress,
            this.providerAddress,
            txTo
        ];

        const methodArguments: unknown[] = [
            `${this.type.toLowerCase()}:${this.bridgeType}`,
            routerCallParams
        ];

        if (!this.from.isNative) {
            methodArguments.push(txTo);
        }
        methodArguments.push(txData);

        const value = this.getSwapValue(providerValue);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    private async refetchTxData(): Promise<EvmTransaction> {
        const amountWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        ).stringWeiAmount;
        const response = await this.rangoClientRef.swap({
            from: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[
                        this.from.blockchain as RangoCrossChainSupportedBlockchain
                    ],
                symbol: this.from.symbol,
                address: this.from.isNative ? null : this.from.address
            },
            to: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[this.to.blockchain as RangoCrossChainSupportedBlockchain],
                symbol: this.to.symbol,
                address: this.to.isNative ? null : this.to.address
            },
            amount: amountWithoutFee,
            disableEstimate: false,
            slippage: String(this.slippageTolerance * 100),
            fromAddress: this.walletAddress,
            toAddress: this.walletAddress,
            referrerAddress: null,
            referrerFee: null,
            swappers: this.allowedSwappers
        });
        this.requestId = response.requestId;

        return response.tx as EvmTransaction;
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee).dividedBy(this.to.tokenAmount);
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
}
