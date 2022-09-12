import { MethodDecoder } from 'src/features/cross-chain/utils/decode-method';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { IRoute } from '@viaprotocol/router-sdk/dist/types';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { VIA_DEFAULT_CONFIG } from 'src/features/cross-chain/providers/via-trade-provider/constants/via-default-api-key';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { Injector } from 'src/core/sdk/injector';
import {
    viaContractAbi,
    viaContractAddress
} from 'src/features/cross-chain/providers/via-trade-provider/constants/contract-data';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { PriceTokenAmount } from 'src/common/tokens';
import { BRIDGE_TYPE, BridgeType } from 'src/features/cross-chain/constants/bridge-type';
import { Via } from '@viaprotocol/router-sdk';
import { NotWhitelistedProviderError } from 'src/common/errors/swap/not-whitelisted-provider.error';
import { FailedToCheckForTransactionReceiptError } from 'src/common/errors';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { ViaCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/via-trade-provider/constants/via-cross-chain-supported-blockchain';
import { CrossChainTrade } from 'src/features/cross-chain/providers/common/cross-chain-trade';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { ItType } from 'src/features/cross-chain/models/it-type';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { SwapRequestError } from 'src/common/errors/swap/swap-request.error';
import { compareAddresses } from 'src/common/utils/blockchain';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/constants/erc-20-abi';
import BigNumber from 'bignumber.js';

export class ViaCrossChainTrade extends CrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount,
        route: IRoute
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    private readonly via = new Via(VIA_DEFAULT_CONFIG);

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    private readonly route: IRoute;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public readonly itType: ItType;

    public readonly bridgeType: BridgeType;

    protected readonly fromWeb3Public: EvmWeb3Public;

    protected get fromContractAddress(): string {
        return viaContractAddress[this.from.blockchain as ViaCrossChainSupportedBlockchain];
    }

    public get uuid(): string {
        return this.route.actions[0]!.uuid;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
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
        providerAddress: string
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

        const methodArguments: unknown[] = [swapArguments];
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
}
