import BigNumber from 'bignumber.js';
import { BlockchainsInfo, PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import { BridgeType, SwapTransactionOptions, TradeType } from 'src/features';
import { ContractParams } from '@rsdk-features/cross-chain/models/contract-params';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { GasData } from '@rsdk-features/cross-chain/models/gas-data';
import { Injector } from 'src/core/sdk/injector';
import { EvmTransaction, RangoClient } from 'rango-sdk-basic/lib';
import { compareAddresses, FailedToCheckForTransactionReceiptError } from 'src/common';
import { NotWhitelistedProviderError } from 'src/common/errors/swap/not-whitelisted-provider.error';
import { CrossChainTrade } from '../common/cross-chain-trade';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { RANGO_CONTRACT_ADDRESSES } from './constants/contract-address';
import { RangoCrossChainSupportedBlockchain } from './constants/rango-cross-chain-supported-blockchain';
import { commonCrossChainAbi } from '../common/constants/common-cross-chain-abi';

export class RangoCrossChainTrade extends CrossChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly fromWeb3Public: Web3Public;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly slippageTolerance: number;

    public readonly gasData: GasData | null = null;

    public readonly priceImpact: number | null;

    public readonly toTokenAmountMin: BigNumber;

    public readonly itType: { from: TradeType | undefined; to: TradeType | undefined };

    public readonly rangoClientRef: RangoClient;

    public readonly bridgeType: BridgeType | undefined;

    public requestId: string | undefined;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public get fromBlockchain(): RangoCrossChainSupportedBlockchain {
        return this.from.blockchain as RangoCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return RANGO_CONTRACT_ADDRESSES[this.fromBlockchain].rubicRouter;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            toTokenAmountMin: BigNumber;
            slippageTolerance: number;
            feeInfo: FeeInfo;
            itType: { from: TradeType | undefined; to: TradeType | undefined };
            bridgeType: BridgeType | undefined;
            priceImpact: number | null;
            cryptoFeeToken: PriceTokenAmount;
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
        this.bridgeType = crossChainTrade.bridgeType;
        this.itType = crossChainTrade.itType;
        this.priceImpact = crossChainTrade.priceImpact;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
        this.rangoClientRef = rangoClientRef;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        const { onConfirm } = options;
        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams();

        const gasData = await this.getGasData({
            contractAddress,
            contractAbi,
            methodArguments,
            methodName,
            value
        });

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        console.log({ methodName, methodArguments, value });

        try {
            await Injector.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                {
                    value,
                    onTransactionHash,
                    gas: gasData?.gasLimit,
                    gasPrice: gasData?.gasPrice
                }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async getContractParams(): Promise<ContractParams> {
        const { txData, value, txTo } = await this.refetchTxData();

        await this.checkProviderIsWhitelisted(txTo);

        const routerCallParams = [
            this.from.address,
            this.from.stringWeiAmount,
            BlockchainsInfo.getBlockchainByName(this.to.blockchain).id,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            this.walletAddress,
            this.providerAddress,
            txTo
        ];

        const methodArguments: unknown[] = [routerCallParams];

        if (!this.from.isNative) {
            methodArguments.push(txTo);
        }
        methodArguments.push(txData);

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const cryptoFee = Web3Pure.toWei(this.feeInfo?.cryptoFee?.amount || 0);
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const msgValue = new BigNumber(sourceValue)
            .plus(fixedFee)
            .plus(parseInt(value || '0'))
            .toFixed(0);

        console.log('message value data', {
            fee: { fixedFee, cryptoFee },
            rangoValue: parseInt(value || '0'),
            sum: msgValue
        });

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value: msgValue
        };
    }

    private async refetchTxData(): Promise<EvmTransaction> {
        const response = await this.rangoClientRef.swap({
            from: {
                blockchain: this.from.blockchain,
                symbol: this.from.symbol,
                address: this.from.isNative ? null : this.from.address
            },
            to: {
                blockchain: this.to.blockchain,
                symbol: this.to.symbol,
                address: this.to.isNative ? null : this.to.address
            },
            amount: this.from.weiAmount.toFixed(0),
            disableEstimate: false,
            slippage: String(this.slippageTolerance * 100),
            fromAddress: this.walletAddress,
            toAddress: this.walletAddress,
            referrerAddress: null,
            referrerFee: null
        });
        this.requestId = response.requestId;

        return response.tx as EvmTransaction;
    }

    protected async checkTradeErrors(): Promise<void> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();
        await this.checkUserBalance();
    }

    /** @internal */
    private async getGasData(data: ContractParams): Promise<GasData | null> {
        const fromBlockchain = this.from.blockchain as RangoCrossChainSupportedBlockchain;
        const walletAddress = Injector.web3Private.address;

        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } = data;
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
                new BigNumber(await Injector.gasPriceApi.getGasPrice(this.from.blockchain))
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

    private async checkProviderIsWhitelisted(providerRouter: string): Promise<void> {
        const whitelistedContracts = await Injector.web3PublicService
            .getWeb3Public(this.from.blockchain)
            .callContractMethod<string[]>(
                this.fromContractAddress,
                commonCrossChainAbi,
                'getAvailableRouters'
            );

        if (
            !whitelistedContracts.find(whitelistedContract =>
                compareAddresses(whitelistedContract, providerRouter)
            )
        ) {
            throw new NotWhitelistedProviderError(providerRouter);
        }
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(usdCryptoFee).dividedBy(this.to.tokenAmount);
    }
}
