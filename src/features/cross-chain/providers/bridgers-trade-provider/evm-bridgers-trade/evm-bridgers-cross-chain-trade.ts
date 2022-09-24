import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceTokenAmount } from 'src/common/tokens';
import { rubicProxyContractAddress } from 'src/features/cross-chain/providers/common/constants/rubic-proxy-contract-address';
import BigNumber from 'bignumber.js';
import { BridgersEvmCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';
import { EvmCrossChainTrade } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/models/gas-data';
import { ContractParams } from 'src/features/cross-chain/providers/common/models/contract-params';
import { GetContractParamsOptions } from 'src/features/cross-chain/providers/common/models/get-contract-params-options';
import { MarkRequired } from 'ts-essentials';
import { getMethodArgumentsAndTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/utils/get-method-arguments-and-transaction-data';
import { EvmBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/evm-bridgers-trade/models/evm-bridgers-transaction-data';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { Injector } from 'src/core/injector/injector';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EvmSwapTransactionOptions } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/models/evm-swap-transaction-options';

export class EvmBridgersCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
        to: PriceTokenAmount<TronBlockchainName>,
        fromAmountWithoutFeeWei: string,
        receiverAddress: string
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new EvmBridgersCrossChainTrade(
                    {
                        from,
                        to,
                        fromAmountWithoutFeeWei,
                        toTokenAmountMin: new BigNumber(0),
                        feeInfo: {
                            fixedFee: null,
                            platformFee: null,
                            cryptoFee: null
                        },
                        gasData: null
                    },
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;

    public readonly to: PriceTokenAmount<TronBlockchainName>;

    private readonly fromAmountWithoutFeeWei: string;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly itType = { from: undefined, to: undefined };

    public readonly priceImpact: number | null;

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.from.blockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;
            to: PriceTokenAmount<TronBlockchainName>;
            fromAmountWithoutFeeWei: string;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            gasData: GasData;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.fromAmountWithoutFeeWei = crossChainTrade.fromAmountWithoutFeeWei;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
    }

    public async swap(
        options: MarkRequired<EvmSwapTransactionOptions, 'receiverAddress'>
    ): Promise<string | never> {
        return super.swap(options);
    }

    protected async getContractParams(
        options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
    ): Promise<ContractParams> {
        const { methodArguments, transactionData } =
            await getMethodArgumentsAndTransactionData<EvmBridgersTransactionData>(
                this.from,
                this.to,
                this.fromAmountWithoutFeeWei,
                this.toTokenAmountMin,
                this.walletAddress,
                options
            );

        const encodedData = transactionData.data;
        methodArguments.push(encodedData);

        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(transactionData.value).plus(fixedFee).toFixed();

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
