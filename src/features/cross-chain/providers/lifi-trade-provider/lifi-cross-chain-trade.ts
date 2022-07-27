import BigNumber from 'bignumber.js';
import { BlockchainsInfo, PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import {
    CROSS_CHAIN_TRADE_TYPE,
    SwapTransactionOptions,
    TRADE_TYPE,
    TradeType
} from 'src/features';
import { Route } from '@lifi/sdk';
import { Injector } from 'src/core/sdk/injector';
import { FailedToCheckForTransactionReceiptError } from 'src/common';
import { lifiContractAddress } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-contract-data';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { CrossChainTrade } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade';
import { LifiCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { LifiSwapRequestError } from 'src/common/errors/swap/lifi-swap-request.error';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { LiFiTradeSubtype } from 'src/features/cross-chain/providers/lifi-trade-provider/models/lifi-providers';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { FeeInfo } from '../common/models/fee';

/**
 * Calculated Celer cross chain trade.
 */
export class LifiCrossChainTrade extends CrossChainTrade {
    public readonly feeInfo: FeeInfo;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        route: Route
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;
        const walletAddress = Injector.web3Private.address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new LifiCrossChainTrade(
                    {
                        from,
                        to,
                        route,
                        gasData: null,
                        toTokenAmountMin: new BigNumber(0),
                        feeInfo: {
                            fixedFee: { amount: new BigNumber(0), tokenSymbol: '' },
                            platformFee: { percent: 0, tokenSymbol: '' },
                            cryptoFee: null
                        },
                        priceImpact: 0,
                        itType: {
                            from: TRADE_TYPE.ONE_INCH,
                            to: TRADE_TYPE.ONE_INCH
                        }
                    },
                    EMPTY_ADDRESS
                ).getContractParams();

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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    private readonly httpClient = Injector.httpClient;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    protected readonly fromWeb3Public: Web3Public;

    private readonly route: Route;

    public readonly itType: { from: TradeType | undefined; to: TradeType | undefined };

    public readonly priceImpact: number;

    public get fromContractAddress(): string {
        return lifiContractAddress[this.from.blockchain as LifiCrossChainSupportedBlockchain]
            .rubicRouter;
    }

    public readonly subType: LiFiTradeSubtype;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            route: Route;
            gasData: GasData | null;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            priceImpact: number;
            itType: { from: TradeType | undefined; to: TradeType | undefined };
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.subType = this.route?.steps?.[0]?.tool as LiFiTradeSubtype;
        this.feeInfo = crossChainTrade.feeInfo;

        this.priceImpact = crossChainTrade.priceImpact;
        this.itType = crossChainTrade.itType;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        await Promise.all([this.checkUserBalance()]);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams();

        let transactionHash: string;
        try {
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

            await Injector.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                {
                    gas: gasLimit,
                    gasPrice,
                    value,
                    onTransactionHash
                }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            if (err.message.includes('Request failed with status code 500')) {
                throw new LifiSwapRequestError();
            }

            throw err;
        }
    }

    public async getContractParams(): Promise<ContractParams> {
        const data = await this.getSwapData();
        const toChainId = BlockchainsInfo.getBlockchainByName(this.to.blockchain).id;
        const fromContracts =
            lifiContractAddress[this.from.blockchain as LifiCrossChainSupportedBlockchain];

        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            this.walletAddress,
            this.providerAddress,
            fromContracts.providerRouter
        ];

        const methodArguments: unknown[] = [swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(fromContracts.providerGateway);
        }
        methodArguments.push(data);

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(sourceValue).plus(fixedFee).toFixed(0);

        return {
            contractAddress: fromContracts.rubicRouter,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    private async getSwapData(): Promise<string> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: this.walletAddress,
                toAddress: this.walletAddress
            },
            execution: {
                status: 'NOT_STARTED',
                process: [
                    {
                        message: 'Preparing transaction.',
                        startedAt: Date.now(),
                        status: 'STARTED',
                        type: 'CROSS_CHAIN'
                    }
                ]
            }
        };

        const swapResponse: {
            transactionRequest: {
                data: string;
            };
        } = await this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
            ...step
        });

        return swapResponse.transactionRequest.data;
    }

    public getTradeAmountRatio(): BigNumber {
        const fromCost = this.from.price
            .multipliedBy(this.from.tokenAmount)
            .plus(this.feeInfo.fixedFee.amount ? 1 : 0);
        return fromCost.dividedBy(this.to.tokenAmount);
    }
}
