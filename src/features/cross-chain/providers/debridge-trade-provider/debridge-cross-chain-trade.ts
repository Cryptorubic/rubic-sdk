import {
    CROSS_CHAIN_TRADE_TYPE,
    SwapTransactionOptions,
    TRADE_TYPE,
    TradeType
} from 'src/features';
import { CrossChainTrade } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade';
import { BlockchainsInfo, Web3Pure } from 'src/core';
import { Injector } from '@rsdk-core/sdk/injector';
import { FailedToCheckForTransactionReceiptError, PriceTokenAmount } from 'src/common';
import { GasData } from '@rsdk-features/cross-chain/models/gas-data';
import BigNumber from 'bignumber.js';
import { DE_BRIDGE_CONTRACT_ADDRESS } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/contract-address';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { TransactionRequest } from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-request';
import { BytesLike } from 'ethers';
import { TransactionResponse } from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-response';
import { DebridgeCrossChainTradeProvider } from 'src/features/cross-chain/providers/debridge-trade-provider/debridge-cross-chain-trade-provider';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public';

/**
 * Calculated DeBridge cross chain trade.
 */
export class DebridgeCrossChainTrade extends CrossChainTrade {
    /** @internal */
    public readonly transitAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly transactionRequest: TransactionRequest;

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

    public readonly itType: { from: TradeType; to: TradeType };

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    protected readonly fromWeb3Public: EvmWeb3Public;

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

        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = crossChainTrade.priceImpact;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.transitAmount = crossChainTrade.transitAmount;

        this.itType = { from: TRADE_TYPE.ONE_INCH, to: TRADE_TYPE.ONE_INCH };

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        CrossChainTrade.checkReceiverAddress(options?.receiverAddress);

        const { onConfirm, gasLimit, gasPrice } = options;
        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(options);

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                { value, onTransactionHash, gas: gasLimit, gasPrice }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async getContractParams(options: SwapTransactionOptions): Promise<ContractParams> {
        const data = await this.getTransactionRequest(options?.receiverAddress);
        const toChainId = BlockchainsInfo.getBlockchainByName(this.to.blockchain).id;
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

        const methodArguments: unknown[] = [swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(fromContracts.providerGateway);
        }
        methodArguments.push(data);

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const cryptoFee = Web3Pure.toWei(this.feeInfo?.cryptoFee?.amount || 0);
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(sourceValue).plus(cryptoFee).plus(fixedFee).toFixed(0);

        return {
            contractAddress: fromContracts.rubicRouter,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(usdCryptoFee).dividedBy(this.to.tokenAmount);
    }

    private async getTransactionRequest(receiverAddress?: string): Promise<BytesLike> {
        const params = {
            ...this.transactionRequest,
            ...(receiverAddress && { dstChainTokenOutRecipient: receiverAddress })
        };

        const { tx } = await Injector.httpClient.get<TransactionResponse>(
            DebridgeCrossChainTradeProvider.apiEndpoint,
            { params }
        );
        return tx.data;
    }
}
