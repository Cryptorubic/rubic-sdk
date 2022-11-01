import {
    celerSourceTransitTokenFeeMultiplier,
    celerTargetTransitTokenFeeMultiplier
} from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-cross-chain-fee-multipliers';
import {
    CrossChainIsUnavailableError,
    InsufficientFundsGasPriceValueError
} from 'src/common/errors';
import { CelerCrossChainContractData } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-contract-data';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { PriceTokenAmount } from 'src/common/tokens';
import { CelerDirectContractTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-direct-contract-trade/celer-direct-contract-trade';
import { ContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/contract-params';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CelerOnChainContractTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-contract-trade';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';
import { CelerContractTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-contract-trade';
import { Cache } from 'src/common/utils/decorators';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';

/**
 * Calculated Celer cross-chain trade.
 */
export class CelerCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        fromTrade: CelerContractTrade,
        toTrade: CelerContractTrade,
        cryptoFeeToken: PriceTokenAmount,
        maxSlippage: number
    ): Promise<GasData | null> {
        const fromBlockchain = fromTrade.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new CelerCrossChainTrade(
                    {
                        fromTrade,
                        toTrade,
                        cryptoFeeToken,
                        transitFeeToken: {} as PriceTokenAmount,
                        gasData: null,
                        feeInPercents: 0,
                        feeInfo: {
                            fixedFee: { amount: new BigNumber(0), tokenSymbol: '' },
                            platformFee: { percent: 0, tokenSymbol: '' },
                            cryptoFee: null
                        }
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS,
                    maxSlippage
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
                new BigNumber(await Injector.gasPriceApi.getGasPrice(fromTrade.blockchain))
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeSubtype = {
        type: BRIDGE_TYPE.CELER,
        isNative: true
    };

    public readonly feeInPercents: number;

    public readonly feeInfo: FeeInfo;

    public readonly transitFeeToken: PriceTokenAmount;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly fromTrade: CelerContractTrade;

    public readonly toTrade: CelerContractTrade;

    public readonly gasData: GasData | null;

    public readonly cryptoFeeToken: PriceTokenAmount;

    /**
     * Gets price impact in source and target blockchains, based on tokens usd prices.
     */
    @Cache
    public get priceImpactData(): {
        priceImpactFrom: number | null;
        priceImpactTo: number | null;
    } {
        const calculatePriceImpact = (trade: CelerContractTrade): number | null => {
            return trade.fromToken.calculatePriceImpactPercent(trade.toToken);
        };

        return {
            priceImpactFrom: calculatePriceImpact(this.fromTrade),
            priceImpactTo: calculatePriceImpact(this.toTrade)
        };
    }

    protected get fromContractAddress(): string {
        return this.fromTrade.contract.address;
    }

    constructor(
        crossChainTrade: {
            fromTrade: CelerContractTrade;
            toTrade: CelerContractTrade;
            cryptoFeeToken: PriceTokenAmount;
            transitFeeToken: PriceTokenAmount;
            gasData: GasData | null;
            feeInPercents: number;
            feeInfo: FeeInfo;
        },
        providerAddress: string,
        private readonly maxSlippage: number
    ) {
        super(providerAddress);

        this.feeInPercents = crossChainTrade.feeInPercents;
        this.fromTrade = crossChainTrade.fromTrade;
        this.toTrade = crossChainTrade.toTrade;
        this.gasData = crossChainTrade.gasData;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.feeInfo = crossChainTrade.feeInfo;

        this.transitFeeToken = crossChainTrade.transitFeeToken;

        this.from = this.fromTrade.fromToken;

        const fromSlippage =
            this.fromTrade instanceof CelerOnChainContractTrade ? this.fromTrade.slippage : 0;
        this.to = new PriceTokenAmount({
            ...this.toTrade.toToken.asStruct,
            weiAmount: this.toTrade.toToken.weiAmount.dividedBy(1 - fromSlippage).dp(0)
        });

        this.onChainSubtype = {
            from:
                crossChainTrade.fromTrade instanceof CelerDirectContractTrade
                    ? undefined
                    : crossChainTrade.fromTrade.provider.type,
            to:
                crossChainTrade.toTrade instanceof CelerDirectContractTrade
                    ? undefined
                    : crossChainTrade.toTrade.provider.type
        };

        this.toTokenAmountMin = this.toTrade.toTokenAmountMin;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        try {
            return await super.swap(options);
        } catch (err) {
            return this.parseSwapErrors(err);
        }
    }

    protected async checkTradeErrors(): Promise<void | never> {
        await Promise.all([super.checkTradeErrors(), this.checkContractsState()]);
    }

    private async checkContractsState(): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            this.fromTrade.contract.isPaused(),
            this.toTrade.contract.isPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    private parseSwapErrors(err: Error): never {
        const errMessage = err?.message || err?.toString?.();
        if (errMessage?.includes('swapContract: Not enough amount of tokens')) {
            throw new CrossChainIsUnavailableError();
        }
        if (errMessage?.includes('err: insufficient funds for gas * price + value')) {
            throw new InsufficientFundsGasPriceValueError();
        }
        throw err;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const { fromTrade } = this;

        const contractAddress = fromTrade.contract.address;

        const { methodName, contractAbi } = fromTrade.getMethodNameAndContractAbi();

        const methodArguments = await fromTrade.getMethodArguments(
            this.toTrade,
            options?.fromAddress || this.walletAddress,
            this.providerAddress,
            {
                maxSlippage: this.maxSlippage,
                receiverAddress: options?.receiverAddress || this.walletAddress
            }
        );

        const tokenInAmountAbsolute = fromTrade.fromToken.weiAmount;
        const msgValue = await this.calculateSwapValue(tokenInAmountAbsolute, methodArguments);
        const value = new BigNumber(msgValue).toFixed(0);
        return {
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value
        };
    }

    private async calculateSwapValue(amountIn: BigNumber, data: unknown[]): Promise<number> {
        const contract = this.fromTrade.contract as CelerCrossChainContractData;
        const { isNative } = this.fromTrade.fromToken;
        const isBridge = this.fromTrade.fromToken.isEqualTo(this.fromTrade.toToken);
        const isToTransit = this.toTrade.fromToken.isEqualTo(this.toTrade.toToken);

        const message = EvmWeb3Pure.asciiToBytes32(JSON.stringify(data));
        const messageBusAddress = await contract.messageBusAddress();
        const cryptoFee = await contract.destinationCryptoFee(this.toTrade.blockchain);
        const feePerByte = await contract.celerFeePerByte(message, messageBusAddress);
        const feeBase = await contract.celerFeeBase(messageBusAddress);

        const fixedFee = Web3Pure.toWei(this.feeInfo.fixedFee?.amount || 0);

        if (isNative) {
            return amountIn
                .plus(feePerByte)
                .plus(cryptoFee)
                .plus(feeBase)
                .plus(fixedFee)
                .toNumber();
        }

        if (isBridge) {
            const adjustedFeeBase = Number(feeBase) * celerSourceTransitTokenFeeMultiplier;
            return Number(feePerByte) + Number(cryptoFee) + Number(fixedFee) + adjustedFeeBase;
        }

        if (isToTransit) {
            const adjustedFeeBase = Number(feePerByte) * celerTargetTransitTokenFeeMultiplier;
            return Number(feeBase) + Number(cryptoFee) + Number(fixedFee) + adjustedFeeBase;
        }

        return Number(feePerByte) + Number(cryptoFee) + Number(feeBase) + Number(fixedFee);
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const cryptoFeeCost = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(cryptoFeeCost).dividedBy(this.to.tokenAmount);
    }
}
