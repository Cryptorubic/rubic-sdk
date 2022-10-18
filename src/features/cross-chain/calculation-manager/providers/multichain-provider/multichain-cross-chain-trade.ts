import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { Injector } from 'src/core/injector/injector';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { PriceTokenAmount } from 'src/common/tokens';
import { ContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/contract-params';
import { ViaCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/via-provider/constants/via-cross-chain-supported-blockchain';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { MultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/multichain-method-name';
import { getFromWithoutFee } from 'src/features/cross-chain/calculation-manager/utils/get-from-without-fee';
import { multichainContractAbi } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/constants/multichain-contract-abi';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';

export class MultichainCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount,
        routerAddress: string,
        spenderAddress: string,
        multichainMethodName: MultichainMethodName,
        anyTokenAddress: string
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new MultichainCrossChainTrade(
                    {
                        from,
                        to,
                        gasData: null,
                        priceImpact: 0,
                        toTokenAmountMin: new BigNumber(0),
                        feeInfo: {
                            fixedFee: null,
                            platformFee: null,
                            cryptoFee: null
                        },
                        routerAddress,
                        spenderAddress,
                        routerMethodName: multichainMethodName,
                        anyTokenAddress
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.MULTICHAIN;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly itType = { from: undefined, to: undefined };

    private readonly routerAddress: string;

    private readonly spenderAddress: string;

    private readonly routerMethodName: MultichainMethodName;

    private readonly anyTokenAddress: string;

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.from.blockchain as ViaCrossChainSupportedBlockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount;
            gasData: GasData;
            priceImpact: number;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            routerAddress: string;
            spenderAddress: string;
            routerMethodName: MultichainMethodName;
            anyTokenAddress: string;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.routerAddress = crossChainTrade.routerAddress;
        this.spenderAddress = crossChainTrade.spenderAddress;
        this.routerMethodName = crossChainTrade.routerMethodName;
        this.anyTokenAddress = crossChainTrade.anyTokenAddress;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const toChainId = blockchainId[this.to.blockchain];
        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            receiverAddress,
            this.providerAddress,
            this.routerAddress
        ];

        const methodArguments: unknown[] = ['native:multichain', swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(this.spenderAddress);
        }

        const fromAmountWithoutFee = getFromWithoutFee(this.from, this.feeInfo).stringWeiAmount;
        let multichainMethodArguments: unknown[];
        if (this.routerMethodName === 'anySwapOutNative') {
            multichainMethodArguments = [this.anyTokenAddress, receiverAddress, toChainId];
        } else {
            multichainMethodArguments = [
                this.anyTokenAddress,
                receiverAddress,
                fromAmountWithoutFee,
                toChainId
            ];
        }
        const encodedData = EvmWeb3Pure.encodeFunctionCall(
            multichainContractAbi,
            this.routerMethodName,
            multichainMethodArguments
        );
        methodArguments.push(encodedData);

        await this.checkProviderIsWhitelisted(this.routerAddress, this.spenderAddress);

        const value = this.getSwapValue();

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
}
