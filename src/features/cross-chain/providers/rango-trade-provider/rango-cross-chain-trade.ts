import BigNumber from 'bignumber.js';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { GasData } from 'src/features/cross-chain/providers/common/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { EvmTransaction, RangoClient } from 'rango-sdk-basic/lib';
import {
    NotWhitelistedProviderError,
    FailedToCheckForTransactionReceiptError
} from 'src/common/errors';
import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { BridgeType } from 'src/features/cross-chain/providers/common/models/bridge-type';
import { TradeType } from 'src/features/instant-trades/models/trade-type';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { RANGO_BLOCKCHAIN_NAME } from './constants/rango-blockchain-name';
import { RANGO_API_KEY } from './constants/rango-api-key';
import { commonCrossChainAbi } from '../common/constants/common-cross-chain-abi';
import { RangoCrossChainSupportedBlockchain } from './constants/rango-cross-chain-supported-blockchain';
import { RANGO_CONTRACT_ADDRESSES } from './constants/contract-address';

export class RangoCrossChainTrade extends CrossChainTrade {
    /**  @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as RangoCrossChainSupportedBlockchain;
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;

        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new RangoCrossChainTrade(
                    {
                        from,
                        to,
                        toTokenAmountMin: new BigNumber(0),
                        slippageTolerance: 4,
                        cryptoFeeToken: {} as PriceTokenAmount,
                        feeInfo: {
                            cryptoFee: null,
                            fixedFee: null,
                            platformFee: null
                        },
                        itType: {
                            from: undefined,
                            to: undefined
                        },
                        bridgeType: undefined,
                        priceImpact: null,
                        gasData: {
                            gasLimit: new BigNumber(0),
                            gasPrice: new BigNumber(0)
                        }
                    },
                    new RangoClient(RANGO_API_KEY),
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams();

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

    public readonly feeInfo: FeeInfo;

    public readonly fromWeb3Public: EvmWeb3Public;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly slippageTolerance: number;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    public readonly toTokenAmountMin: BigNumber;

    public readonly itType: { from: TradeType | undefined; to: TradeType | undefined };

    public readonly rangoClientRef: RangoClient;

    public readonly bridgeType: BridgeType | undefined;

    public requestId: string | undefined;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public get fromBlockchain(): RangoCrossChainSupportedBlockchain {
        return this.from.blockchain as RangoCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return RANGO_CONTRACT_ADDRESSES[this.fromBlockchain].rubicRouter;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            toTokenAmountMin: BigNumber;
            slippageTolerance: number;
            feeInfo: FeeInfo;
            itType: { from: TradeType | undefined; to: TradeType | undefined };
            bridgeType: BridgeType | undefined;
            priceImpact: number | null;
            cryptoFeeToken: PriceTokenAmount;
            gasData: GasData | null;
        },
        rangoClientRef: RangoClient,
        providerAddress: string
    ) {
        super(providerAddress);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.bridgeType = crossChainTrade.bridgeType;
        this.itType = crossChainTrade.itType;
        this.priceImpact = crossChainTrade.priceImpact;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.gasData = crossChainTrade.gasData;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
        this.rangoClientRef = rangoClientRef;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        const { onConfirm } = options;
        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams();

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                {
                    value,
                    onTransactionHash,
                    gas: this.gasData?.gasLimit,
                    gasPrice: this.gasData?.gasPrice
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

    public async getContractParams(): Promise<ContractParams> {
        const { txData, value, txTo } = await this.refetchTxData();

        await this.checkProviderIsWhitelisted(txTo);

        const routerCallParams = [
            this.from.address,
            this.from.stringWeiAmount,
            blockchainId[this.to.blockchain],
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            this.walletAddress,
            this.providerAddress,
            txTo
        ];

        const methodArguments: unknown[] = [routerCallParams];

        if (!this.from.isNative) {
            methodArguments.push(txTo);
        }
        methodArguments.push(txData);

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const msgValue = new BigNumber(sourceValue)
            .plus(fixedFee)
            .plus(value ? `${value}` : 0)
            .toFixed(0);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value: msgValue
        };
    }

    private async refetchTxData(): Promise<EvmTransaction> {
        const response = await this.rangoClientRef.swap({
            from: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[
                        this.from.blockchain as RangoCrossChainSupportedBlockchain
                    ],
                symbol: this.from.symbol,
                address: this.from.isNative ? null : this.from.address
            },
            to: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[this.to.blockchain as RangoCrossChainSupportedBlockchain],
                symbol: this.to.symbol,
                address: this.to.isNative ? null : this.to.address
            },
            amount: this.from.weiAmount.toFixed(0),
            disableEstimate: false,
            slippage: String(this.slippageTolerance * 100),
            fromAddress: this.walletAddress,
            toAddress: this.walletAddress,
            referrerAddress: null,
            referrerFee: null
        });
        this.requestId = response.requestId;

        return response.tx as EvmTransaction;
    }

    private async checkProviderIsWhitelisted(providerRouter: string): Promise<void> {
        const whitelistedContracts = await Injector.web3PublicService
            .getWeb3Public(this.from.blockchain)
            .callContractMethod<string[]>(
                this.fromContractAddress,
                commonCrossChainAbi,
                'getAvailableRouters'
            );

        if (
            !whitelistedContracts.find(whitelistedContract =>
                compareAddresses(whitelistedContract, providerRouter)
            )
        ) {
            throw new NotWhitelistedProviderError(providerRouter);
        }
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(usdCryptoFee).dividedBy(this.to.tokenAmount);
    }
}
