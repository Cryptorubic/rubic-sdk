import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { SYMBIOSIS_CONTRACT_ADDRESS_V1 } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/contract-address-v1';
import { SYMBIOSIS_CONTRACT_ADDRESS_V2 } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/contract-address-v2';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { SymbiosisTradeData } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

/**
 * Calculated Symbiosis cross-chain trade.
 */
export class SymbiosisCrossChainTrade extends EvmCrossChainTrade {
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
                        feeInfo: {},
                        transitAmount: new BigNumber(NaN),
                        version: 'v1'
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

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.SYMBIOSIS;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly feeInfo: FeeInfo;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private readonly slippage: number;

    public readonly version: 'v1' | 'v2';

    private readonly getTransactionRequest: (
        fromAddress: string,
        version: 'v1' | 'v2',
        receiver?: string
    ) => Promise<SymbiosisTradeData>;

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.fromBlockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount;
            swapFunction: (
                fromAddress: string,
                version: 'v1' | 'v2',
                receiver?: string
            ) => Promise<SymbiosisTradeData>;
            gasData: GasData | null;
            priceImpact: number;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
            version: 'v1' | 'v2';
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
        this.slippage = crossChainTrade.slippage;
        this.transitAmount = crossChainTrade.transitAmount;
        this.version = crossChainTrade.version;

        this.onChainSubtype = {
            from: ON_CHAIN_TRADE_TYPE.ONE_INCH,
            to:
                crossChainTrade.to.blockchain === BLOCKCHAIN_NAME.BITCOIN
                    ? ON_CHAIN_TRADE_TYPE.REN_BTC
                    : ON_CHAIN_TRADE_TYPE.ONE_INCH
        };
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const exactIn = await this.getTransactionRequest(
            this.walletAddress,
            this.version,
            options?.receiverAddress
        );
        const { data, value: providerValue } = exactIn.transactionRequest;
        const toChainId = blockchainId[this.to.blockchain];
        const toTokenAddress =
            this.to.blockchain === BLOCKCHAIN_NAME.BITCOIN
                ? EvmWeb3Pure.EMPTY_ADDRESS
                : this.to.address;
        const receiverAddress =
            this.to.blockchain === BLOCKCHAIN_NAME.BITCOIN
                ? EvmWeb3Pure.EMPTY_ADDRESS
                : options?.receiverAddress || this.walletAddress;
        const symbiosisContractAddress =
            this.version === 'v1' ? SYMBIOSIS_CONTRACT_ADDRESS_V1 : SYMBIOSIS_CONTRACT_ADDRESS_V2;

        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            toTokenAddress,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            receiverAddress,
            this.providerAddress,
            symbiosisContractAddress[this.fromBlockchain].providerRouter
        ];

        const methodArguments: unknown[] = [`native:${this.type.toLowerCase()}`, swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(symbiosisContractAddress[this.fromBlockchain].providerGateway);
        }
        methodArguments.push(data);

        const value = this.getSwapValue(providerValue?.toString());

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
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
