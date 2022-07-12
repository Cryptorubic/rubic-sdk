import BigNumber from 'bignumber.js';
import { BlockchainsInfo, PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import { CROSS_CHAIN_TRADE_TYPE, SwapTransactionOptions } from 'src/features';
import { Route } from '@lifinance/sdk';
import { Injector } from 'src/core/sdk/injector';
import { FailedToCheckForTransactionReceiptError } from 'src/common';
import {
    lifiContractAbi,
    lifiContractAddress
} from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-contract-data';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { CrossChainTrade } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade';

/**
 * Calculated Celer cross chain trade.
 */
export class LifiCrossChainTrade extends CrossChainTrade {
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
                        fee: new BigNumber(0),
                        feeSymbol: '',
                        feePercent: 0,
                        networkFee: new BigNumber(0),
                        networkFeeSymbol: '',
                        priceImpact: 0
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

    public readonly itType = undefined;

    public readonly fee: BigNumber;

    public readonly feeSymbol: string;

    public readonly feePercent: number;

    public readonly networkFee: BigNumber;

    public readonly networkFeeSymbol: string;

    public readonly priceImpact: number;

    public get fromContractAddress(): string {
        return lifiContractAddress;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            route: Route;
            gasData: GasData | null;
            toTokenAmountMin: BigNumber;
            fee: BigNumber;
            feeSymbol: string;
            feePercent: number;
            networkFee: BigNumber;
            networkFeeSymbol: string;
            priceImpact: number;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;

        this.fee = crossChainTrade.fee;
        this.feeSymbol = crossChainTrade.feeSymbol;
        this.feePercent = crossChainTrade.feePercent;
        this.networkFee = crossChainTrade.networkFee;
        this.networkFeeSymbol = crossChainTrade.networkFeeSymbol;
        this.priceImpact = crossChainTrade.priceImpact;

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

            await Injector.web3Private.executeContractMethod(
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
            throw err;
        }
    }

    public async getContractParams() {
        const methodName = this.from.isNative ? 'lifiCallWithNative' : 'lifiCall';

        const data = await this.getSwapData();
        const toChainId = BlockchainsInfo.getBlockchainByName(this.to.blockchain).id;
        const methodArguments = [
            [
                this.from.address,
                this.to.address,
                this.providerAddress,
                this.walletAddress,
                this.from.stringWeiAmount,
                Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
                toChainId
            ],
            data
        ];

        const networkFee = await this.getNetworkFee();
        const value = new BigNumber(this.from.isNative ? this.from.stringWeiAmount : '0')
            .plus(networkFee)
            .toFixed(0);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: lifiContractAbi,
            methodName,
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

    private getNetworkFee(): Promise<string> {
        return this.fromWeb3Public.callContractMethod(
            this.fromContractAddress,
            lifiContractAbi,
            'fixedCryptoFee'
        );
    }

    public getTradeAmountRatio(): BigNumber {
        const fromCost = this.from.price
            .multipliedBy(this.from.tokenAmount)
            .plus(this.networkFee.gt(0) ? 1 : 0);
        return fromCost.dividedBy(this.to.tokenAmount);
    }
}
