import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceTokenAmount } from 'src/common/tokens';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/providers/common/models/bridge-type';
import { LifiCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { lifiContractAddress } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-contract-data';
import { GasData } from 'src/features/cross-chain/providers/common/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { SwapRequestError } from 'src/common/errors/swap/swap-request.error';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import BigNumber from 'bignumber.js';
import { Route } from '@lifi/sdk';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

/**
 * Calculated Celer cross chain trade.
 */
export class LifiCrossChainTrade extends CrossChainTrade {
    public readonly feeInfo: FeeInfo;

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

    private readonly httpClient = Injector.httpClient;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    protected readonly fromWeb3Public: EvmWeb3Public;

    private readonly route: Route;

    public readonly itType: { from: TradeType | undefined; to: TradeType | undefined };

    public readonly priceImpact: number;

    public readonly bridgeType: BridgeType | undefined;

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

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        CrossChainTrade.checkReceiverAddress(options?.receiverAddress);

        const { onConfirm, gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(options);

        let transactionHash: string;
        try {
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

            await this.web3Private.tryExecuteContractMethod(
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

            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }

            throw err;
        }
    }

    public async getContractParams(options: SwapTransactionOptions): Promise<ContractParams> {
        const data = await this.getSwapData(options?.receiverAddress);
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

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(sourceValue).plus(fixedFee).toFixed(0);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    private async getSwapData(receiverAddress?: string): Promise<string> {
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

        const swapResponse: {
            transactionRequest: {
                data: string;
            };
        } = await this.httpClient.post('https://li.quest/v1/advanced/stepTransaction', {
            ...step
        });

        return swapResponse.transactionRequest.data;
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
