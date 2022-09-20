import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceTokenAmount } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/providers/common/models/bridge-type';
import { LifiCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { SwapRequestError } from 'src/common/errors';
import { ContractParams } from 'src/features/cross-chain/providers/common/models/contract-params';
import { lifiContractAddress } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-contract-data';
import { GasData } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';
import { Route } from '@lifi/sdk';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmCrossChainTrade } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { EvmSwapTransactionOptions } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/models/evm-swap-transaction-options';
import { GetContractParamsOptions } from 'src/features/cross-chain/providers/common/models/get-contract-params-options';
import { LifiTransactionRequest } from './models/lifi-transaction-request';

/**
 * Calculated Celer cross chain trade.
 */
export class LifiCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        route: Route
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
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
                        },
                        bridgeType: BRIDGE_TYPE.CONNEXT
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    private readonly route: Route;

    public readonly itType: { from: TradeType | undefined; to: TradeType | undefined };

    public readonly priceImpact: number;

    public readonly bridgeType: BridgeType | undefined;

    public readonly feeInfo: FeeInfo;

    private get fromBlockchain(): LifiCrossChainSupportedBlockchain {
        return this.from.blockchain as LifiCrossChainSupportedBlockchain;
    }

    public get fromContractAddress(): string {
        return lifiContractAddress[this.fromBlockchain].rubicRouter;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            route: Route;
            gasData: GasData | null;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            priceImpact: number;
            itType: { from: TradeType | undefined; to: TradeType | undefined };
            bridgeType: BridgeType | undefined;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.bridgeType = crossChainTrade.bridgeType;
        this.feeInfo = crossChainTrade.feeInfo;

        this.priceImpact = crossChainTrade.priceImpact;
        this.itType = crossChainTrade.itType;
    }

    public async swap(options: EvmSwapTransactionOptions = {}): Promise<string | never> {
        try {
            return await super.swap(options);
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const { data, value } = await this.getSwapData(options?.receiverAddress);
        const toChainId = blockchainId[this.to.blockchain];
        const fromContracts = lifiContractAddress[this.fromBlockchain];

        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            options?.receiverAddress || this.walletAddress,
            this.providerAddress,
            fromContracts.providerRouter
        ];

        const methodArguments: unknown[] = [swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(fromContracts.providerGateway);
        }
        methodArguments.push(data);

        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const msgValue = new BigNumber(value ? `${value}` : 0).plus(fixedFee).toFixed(0);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value: msgValue
        };
    }

    private async getSwapData(receiverAddress?: string): Promise<LifiTransactionRequest> {
        const firstStep = this.route.steps[0]!;
        const step = {
            ...firstStep,
            action: {
                ...firstStep.action,
                fromAddress: this.walletAddress,
                toAddress: receiverAddress || this.walletAddress
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

        const swapResponse: { transactionRequest: LifiTransactionRequest } =
            await this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
                ...step
            });

        return swapResponse.transactionRequest;
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
