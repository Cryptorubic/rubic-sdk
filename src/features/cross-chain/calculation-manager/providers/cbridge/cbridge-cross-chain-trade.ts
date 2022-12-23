import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { cbridgeContractAddress } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-address';
import { cbridgeProxyAbi } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-proxy-abi';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { celerTransitTokens } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-transit-tokens';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class CbridgeCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        onChainTrade?: EvmOnChainTrade | null
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as CbridgeCrossChainSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new CbridgeCrossChainTrade(
                    {
                        from,
                        to,
                        gasData: null,
                        priceImpact: 0,
                        slippage: 0,
                        feeInfo: {},
                        maxSlippage: 0,
                        contractAddress: EvmWeb3Pure.EMPTY_ADDRESS,
                        transitMinAmount: new BigNumber(0),
                        onChainTrade: onChainTrade!
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.CELER_BRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): CbridgeCrossChainSupportedBlockchain {
        return this.from.blockchain as CbridgeCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return cbridgeContractAddress[this.fromBlockchain].rubicRouter;
    }

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    private readonly maxSlippage: number;

    private readonly celerContractAddress: string;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly onChainTrade: EvmOnChainTrade | null;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
            priceImpact: number;
            slippage: number;
            feeInfo: FeeInfo;
            maxSlippage: number;
            contractAddress: string;
            transitMinAmount: BigNumber;
            onChainTrade: EvmOnChainTrade | null;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;
        this.toTokenAmountMin = crossChainTrade.transitMinAmount.multipliedBy(
            1 - crossChainTrade.maxSlippage / 10_000_000
        );
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = crossChainTrade.priceImpact;
        this.maxSlippage = crossChainTrade.maxSlippage;
        this.celerContractAddress = crossChainTrade.contractAddress;

        this.onChainSubtype = crossChainTrade.onChainTrade
            ? { from: crossChainTrade.onChainTrade.type, to: undefined }
            : { from: undefined, to: undefined };
        this.onChainTrade = crossChainTrade.onChainTrade;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const toChainId = blockchainId[this.to.blockchain];
        const fromContracts = cbridgeContractAddress[this.fromBlockchain];

        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            receiverAddress,
            this.providerAddress
        ];

        const methodArguments: unknown[] = [];
        if (this.onChainTrade) {
            methodArguments.push(
                celerTransitTokens[this.from.blockchain as CelerCrossChainSupportedBlockchain]
                    .address
            );
            const encodedData = (
                await this.onChainTrade.encodeDirect({
                    fromAddress: options.fromAddress || this.walletAddress,
                    receiverAddress: this.fromContractAddress,
                    supportFee: false
                })
            ).data;
            methodArguments.push(encodedData);
            swapArguments.push(this.onChainTrade.dexContractAddress);
        } else {
            swapArguments.push(EvmWeb3Pure.EMPTY_ADDRESS);
        }
        methodArguments.push(this.maxSlippage, swapArguments);

        const value = this.getSwapValue();

        return {
            contractAddress: fromContracts.rubicRouter,
            contractAbi: cbridgeProxyAbi,
            methodName: this.getMethodName(),
            methodArguments,
            value
        };
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
            slippage: { total: this.maxSlippage / 10_000 }
        };
    }

    private getMethodName(): string {
        if (this.from.isNative) {
            return this.onChainTrade ? 'swapNativeAndBridge' : 'bridgeNative';
        }
        return this.onChainTrade ? 'swapAndBridge' : 'bridge';
    }
}
