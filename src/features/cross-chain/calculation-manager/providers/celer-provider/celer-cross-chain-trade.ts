import BigNumber from 'bignumber.js';
import {
    CrossChainIsUnavailableError,
    DeflationTokenError,
    InsufficientFundsGasPriceValueError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CelerContractTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-contract-trade';
import { CelerDirectContractTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-direct-contract-trade/celer-direct-contract-trade';
import { CelerOnChainContractTrade } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-contract-trade/celer-on-chain-contract-trade/celer-on-chain-contract-trade';
import { CelerCrossChainContractData } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-contract-data';
import {
    celerSourceTransitTokenFeeMultiplier,
    celerTargetTransitTokenFeeMultiplier
} from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-cross-chain-fee-multipliers';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { DeflationTokenManager } from 'src/features/deflation-token-manager/deflation-token-manager';
import { TransactionReceipt } from 'web3-eth';

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
                        feeInfo: {},
                        slippage: 0
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

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.CELER;

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

    private readonly deflationTokenManager = new DeflationTokenManager();

    public isDeflationTokenInTargetNetwork: boolean = false;

    private readonly slippage: number;

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
            slippage: number;
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
        this.slippage = crossChainTrade.slippage;
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
            await this.deflationTokenManager.checkToken(this.to);

            return await super.swap(options);
        } catch (err) {
            this.isDeflationTokenInTargetNetwork = err instanceof DeflationTokenError;
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

        const fixedFee = Web3Pure.toWei(this.feeInfo.rubicProxy?.fixedFee?.amount || 0);

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

    public async approve(
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true
    ): Promise<TransactionReceipt> {
        try {
            if (checkNeedApprove) {
                const needApprove = await this.needApprove();
                if (!needApprove) {
                    throw new UnnecessaryApproveError();
                }
            }

            this.checkWalletConnected();
            await this.checkBlockchainCorrect();

            await this.deflationTokenManager.checkToken(this.to);

            return this.web3Private.approveTokens(
                this.from.address,
                this.fromContractAddress,
                'infinity',
                options
            );
        } catch (error) {
            this.isDeflationTokenInTargetNetwork = error instanceof DeflationTokenError;
            throw error;
        }
    }

    public getUsdPrice(): BigNumber {
        return this.fromTrade.toToken.tokenAmount;
    }

    public getTradeInfo(): TradeInfo {
        const fromPriceImpact = this.fromTrade.fromToken.calculatePriceImpactPercent(
            this.fromTrade.toToken
        );

        const toPriceImpact = this.toTrade.fromToken.calculatePriceImpactPercent(
            this.toTrade.toToken
        );

        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: { from: fromPriceImpact, to: toPriceImpact },
            slippage: { total: this.slippage * 100 }
        };
    }
}
