import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
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
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class DebridgeCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public readonly transitAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly transactionRequest: TransactionRequest;

    private readonly slippage: number;

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
                        feeInfo: {
                            fixedFee: { amount: new BigNumber(0), tokenSymbol: '' },
                            platformFee: { percent: 0, tokenSymbol: '' },
                            cryptoFee: null
                        },
                        transitAmount: new BigNumber(NaN),
                        cryptoFeeToken: from
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

    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): DeBridgeCrossChainSupportedBlockchain {
        return this.from.blockchain as DeBridgeCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return DE_BRIDGE_CONTRACT_ADDRESS[this.fromBlockchain].rubicRouter;
    }

    public readonly feeInfo: FeeInfo;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            transactionRequest: TransactionRequest;
            gasData: GasData | null;
            priceImpact: number;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
            cryptoFeeToken: PriceTokenAmount;
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
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.transitAmount = crossChainTrade.transitAmount;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const { data, value: providerValue } = await this.getTransactionRequest(
            options?.receiverAddress
        );
        const toChainId = blockchainId[this.to.blockchain];
        const fromContracts =
            DE_BRIDGE_CONTRACT_ADDRESS[
                this.from.blockchain as DeBridgeCrossChainSupportedBlockchain
            ];

        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            options?.receiverAddress || this.walletAddress,
            this.providerAddress,
            fromContracts.providerRouter
        ];

        const methodArguments: unknown[] = [`native:${this.type.toLowerCase()}`, swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(fromContracts.providerGateway);
        }
        methodArguments.push(data);

        const value = this.getSwapValue(providerValue);

        return {
            contractAddress: fromContracts.rubicRouter,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
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
            priceImpact: { total: this.priceImpact },
            slippage: { total: this.slippage * 100 }
        };
    }
}
