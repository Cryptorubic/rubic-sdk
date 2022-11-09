import { MethodDecoder } from 'src/features/cross-chain/calculation-manager/utils/decode-method';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { IRoute } from '@viaprotocol/router-sdk/dist/types';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { VIA_DEFAULT_CONFIG } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-default-api-key';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { viaContractAddress } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/contract-data';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { Via } from '@viaprotocol/router-sdk';
import { RubicSdkError, SwapRequestError } from 'src/common/errors';
import { ContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/contract-params';
import { ViaCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-cross-chain-supported-blockchain';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { compareAddresses } from 'src/common/utils/blockchain';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';

export class ViaCrossChainTrade extends EvmCrossChainTrade {
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
                        onChainSubtype: { from: undefined, to: undefined },
                        bridgeType: BRIDGE_TYPE.VIA
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS,
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

    public readonly isAggregator = false;

    private readonly via = new Via(VIA_DEFAULT_CONFIG);

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    private readonly route: IRoute;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType: BridgeType;

    private readonly calculationWalletAddress: string;

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
            onChainSubtype: OnChainSubtype;
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
        this.calculationWalletAddress = calculationWalletAddress;

        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.bridgeType = crossChainTrade.bridgeType;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkViaErrors();

        try {
            const transactionHash = await super.swap(options);

            try {
                await this.via.startRoute({
                    fromAddress: this.walletAddress,
                    toAddress: options?.receiverAddress || this.walletAddress,
                    routeId: this.route.routeId,
                    txHash: transactionHash!
                });
            } catch {}

            return transactionHash;
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const swapTransaction = await this.via.buildTx({
            routeId: this.route.routeId,
            fromAddress: this.walletAddress,
            receiveAddress: options?.receiverAddress || this.walletAddress,
            numAction: 0
        });
        const toChainId = blockchainId[this.to.blockchain];
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
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
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
        if (compareAddresses(this.walletAddress, this.calculationWalletAddress)) {
            return;
        }
        throw new RubicSdkError(
            'Calculation and swap wallet addresses are different. You should recalculate trade.'
        );
    }
}
