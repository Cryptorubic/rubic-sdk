import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import {
    ChangenowCrossChainFromSupportedBlockchain,
    ChangenowCrossChainToSupportedBlockchain
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-cross-chain-supported-blockchain';
import { ChangenowCurrency } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import { ChangenowExchangeResponse } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-exchange-api';
import { ChangenowTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-trade';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { MarkRequired } from 'ts-essentials';

export class ChangenowCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        changenowTrade: ChangenowTrade,
        receiverAddress: string
    ): Promise<GasData | null> {
        const fromBlockchain = changenowTrade.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new ChangenowCrossChainTrade(
                    changenowTrade,
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams({ receiverAddress });

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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGENOW;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<ChangenowCrossChainFromSupportedBlockchain>;

    public readonly to: PriceTokenAmount<ChangenowCrossChainToSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.CHANGENOW;

    public readonly priceImpact: number | null;

    /**
     * id of changenow trade, used to get trade status.
     */
    public id: string | undefined;

    private readonly fromCurrency: ChangenowCurrency;

    private readonly toCurrency: ChangenowCurrency;

    protected get fromContractAddress(): string {
        throw new RubicSdkError('No contract address');
    }

    constructor(crossChainTrade: ChangenowTrade, providerAddress: string) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;

        this.fromCurrency = crossChainTrade.fromCurrency;
        this.toCurrency = crossChainTrade.toCurrency;

        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;

        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
    }

    public async needApprove(): Promise<boolean> {
        return false;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
        );

        const { onConfirm, gasLimit, gasPrice } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            const { id, payinAddress } = await this.getPaymentInfo(
                this.from.tokenAmount,
                options.receiverAddress!
            );
            this.id = id;

            if (this.from.isNative) {
                await this.web3Private.trySendTransaction(payinAddress, {
                    value: this.from.weiAmount,
                    onTransactionHash
                });
            } else {
                await this.web3Private.tryExecuteContractMethod(
                    this.from.address,
                    ERC20_TOKEN_ABI,
                    'transfer',
                    [payinAddress, this.from.stringWeiAmount],
                    { onTransactionHash, gas: gasLimit, gasPrice }
                );
            }

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    private async getPaymentInfo(
        fromAmount: BigNumber,
        receiverAddress: string
    ): Promise<ChangenowExchangeResponse> {
        return Injector.httpClient.post<ChangenowExchangeResponse>(
            'https://api.changenow.io/v2/exchange',
            {
                fromCurrency: this.fromCurrency.ticker,
                toCurrency: this.toCurrency.ticker,
                fromNetwork: this.fromCurrency.network,
                toNetwork: this.toCurrency.network,
                fromAmount: fromAmount.toFixed(),
                address: receiverAddress,
                flow: 'standard'
            },
            {
                headers: {
                    'x-changenow-api-key': changenowApiKey
                }
            }
        );
    }

    protected getContractParams(
        _options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
    ): Promise<ContractParams> {
        throw new RubicSdkError('Not implemented');
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
            priceImpact: this.priceImpact ? { total: this.priceImpact } : null,
            slippage: null
        };
    }
}
