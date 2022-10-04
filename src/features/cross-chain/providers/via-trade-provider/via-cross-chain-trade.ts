import { BlockchainsInfo, PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import { IRoute } from '@viaprotocol/router-sdk/dist/types';
import { Via } from '@viaprotocol/router-sdk';
import {
    compareAddresses,
    FailedToCheckForTransactionReceiptError,
    RubicSdkError
} from 'src/common';
import { VIA_DEFAULT_CONFIG } from 'src/features/cross-chain/providers/via-trade-provider/constants/via-default-api-key';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { Injector } from 'src/core/sdk/injector';
import {
    BRIDGE_TYPE,
    BridgeType,
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTrade,
    SwapTransactionOptions
} from 'src/features';
import BigNumber from 'bignumber.js';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { ItType } from 'src/features/cross-chain/models/it-type';
import {
    viaContractAbi,
    viaContractAddress
} from 'src/features/cross-chain/providers/via-trade-provider/constants/contract-data';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { MethodDecoder } from 'src/features/cross-chain/utils/decode-method';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/constants/erc-20-abi';
import { SwapRequestError } from 'src/common/errors/swap/swap-request.error';
import { NotWhitelistedProviderError } from 'src/common/errors/swap/not-whitelisted-provider.error';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { ViaCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/via-trade-provider/constants/via-cross-chain-supported-blockchain';

export class ViaCrossChainTrade extends CrossChainTrade {
    private readonly calculationWalletAddress: string;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        route: IRoute
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;
        const walletAddress = Injector.web3Private.address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new ViaCrossChainTrade(
                    {
                        from,
                        to,
                        route,
                        gasData: null,
                        priceImpact: 0,
                        toTokenAmountMin: new BigNumber(0),
                        feeInfo: {
                            fixedFee: null,
                            platformFee: null,
                            cryptoFee: null
                        },
                        cryptoFeeToken: {} as PriceTokenAmount,
                        itType: { from: undefined, to: undefined },
                        bridgeType: BRIDGE_TYPE.DE_BRIDGE
                    },
                    EMPTY_ADDRESS,
                    EMPTY_ADDRESS
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    private readonly via = new Via(VIA_DEFAULT_CONFIG);

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    private readonly route: IRoute;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public readonly itType: ItType;

    public readonly bridgeType: BridgeType;

    protected readonly fromWeb3Public: Web3Public;

    protected get fromContractAddress(): string {
        return viaContractAddress[this.from.blockchain as ViaCrossChainSupportedBlockchain];
    }

    public get uuid(): string {
        return this.route.actions[0]!.uuid;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            route: IRoute;
            gasData: GasData;
            priceImpact: number;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            cryptoFeeToken: PriceTokenAmount;
            itType: ItType;
            bridgeType: BridgeType;
        },
        providerAddress: string,
        calculationWalletAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.itType = crossChainTrade.itType;
        this.bridgeType = crossChainTrade.bridgeType;
        this.calculationWalletAddress = calculationWalletAddress;
        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        this.checkViaErrors();
        await this.checkAllowanceAndApprove(options);
        CrossChainTrade.checkReceiverAddress(options?.receiverAddress);

        const { onConfirm, gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(options);

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await Injector.web3Private.tryExecuteContractMethod(
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

            try {
                await this.via.startRoute({
                    fromAddress: this.walletAddress,
                    toAddress: options?.receiverAddress || this.walletAddress,
                    routeId: this.route.routeId,
                    txHash: transactionHash!
                });
            } catch {}

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
        const swapTransaction = await this.via.buildTx({
            routeId: this.route.routeId,
            fromAddress: this.walletAddress,
            receiveAddress: options?.receiverAddress || this.walletAddress,
            numAction: 0
        });
        const toChainId = BlockchainsInfo.getBlockchainByName(this.to.blockchain).id;
        const providerRouter = swapTransaction.to;
        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            options?.receiverAddress || this.walletAddress,
            this.providerAddress,
            providerRouter
        ];

        const methodArguments: unknown[] = [
            `${this.type.toLowerCase()}:${this.bridgeType}`,
            swapArguments
        ];
        let providerGateway: string | undefined;
        if (!this.from.isNative) {
            const approveTransaction = await this.via.buildApprovalTx({
                owner: this.fromContractAddress,
                routeId: this.route.routeId,
                numAction: 0
            });
            const decodedData = MethodDecoder.decodeMethod(
                ERC20_TOKEN_ABI.find(method => method.name === 'approve')!,
                approveTransaction.data
            );
            providerGateway = decodedData.params.find(param => param.name === '_spender')!.value;
            methodArguments.push(providerGateway);
        }
        methodArguments.push(swapTransaction.data);

        await this.checkProviderIsWhitelisted(providerRouter, providerGateway);

        const value = this.getSwapValue(swapTransaction.value);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    private async checkProviderIsWhitelisted(providerRouter: string, providerGateway?: string) {
        const whitelistedContracts = await Injector.web3PublicService
            .getWeb3Public(this.from.blockchain)
            .callContractMethod<string[]>(
                this.fromContractAddress,
                viaContractAbi,
                'getAvailableRouters'
            );

        if (
            !whitelistedContracts.find(whitelistedContract =>
                compareAddresses(whitelistedContract, providerRouter)
            ) ||
            (providerGateway &&
                !whitelistedContracts.find(whitelistedContract =>
                    compareAddresses(whitelistedContract, providerGateway)
                ))
        ) {
            throw new NotWhitelistedProviderError(providerRouter, providerGateway);
        }
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd.plus(usdCryptoFee).dividedBy(this.to.tokenAmount);
    }

    private checkViaErrors(): void {
        this.checkAddressEquality();
    }

    private checkAddressEquality(): void {
        if (compareAddresses(Injector.web3Private.address, this.calculationWalletAddress)) {
            return;
        }
        throw new RubicSdkError(
            'Calculation and swap wallet addresses are different. You should recalculate trade.'
        );
    }
}
