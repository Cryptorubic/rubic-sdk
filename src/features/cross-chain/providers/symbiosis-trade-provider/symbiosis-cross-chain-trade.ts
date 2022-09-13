import { SYMBIOSIS_CONTRACT_ADDRESS } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/contract-address';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceTokenAmount } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

/**
 * Calculated Symbiosis cross chain trade.
 */
export class SymbiosisCrossChainTrade extends CrossChainTrade {
    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly feeInfo: FeeInfo;

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
                        feeInfo: {
                            fixedFee: { amount: new BigNumber(0), tokenSymbol: '' },
                            platformFee: { percent: 0, tokenSymbol: '' },
                            cryptoFee: null
                        },
                        transitAmount: new BigNumber(NaN)
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

    public readonly itType: { from: TradeType; to: TradeType };

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private readonly getTransactionRequest: (
        fromAddress: string,
        receiver?: string
    ) => Promise<{ transactionRequest: TransactionRequest }>;

    protected readonly fromWeb3Public: EvmWeb3Public;

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].rubicRouter;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount;
            swapFunction: (
                fromAddress: string,
                receiver?: string
            ) => Promise<{ transactionRequest: TransactionRequest }>;
            gasData: GasData | null;
            priceImpact: number;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
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

        this.transitAmount = crossChainTrade.transitAmount;

        this.itType = {
            from: TRADE_TYPE.ONE_INCH,
            to:
                crossChainTrade.to.blockchain === BLOCKCHAIN_NAME.BITCOIN
                    ? TRADE_TYPE.REN_BTC
                    : TRADE_TYPE.ONE_INCH
        };

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        CrossChainTrade.checkReceiverAddress(options?.receiverAddress, this.to.blockchain);

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
        const exactIn = await this.getTransactionRequest(
            this.walletAddress,
            options?.receiverAddress
        );
        const { data } = exactIn.transactionRequest;
        const toChainId = blockchainId[this.to.blockchain];
        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            this.to.blockchain === BLOCKCHAIN_NAME.BITCOIN
                ? EvmWeb3Pure.EMPTY_ADDRESS
                : options?.receiverAddress || this.walletAddress,
            this.providerAddress,
            SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].providerRouter
        ];

        const methodArguments: unknown[] = [swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].providerGateway);
        }
        methodArguments.push(data);

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(sourceValue).plus(fixedFee).toFixed(0);

        return {
            contractAddress: SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].rubicRouter,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
