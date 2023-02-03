import BigNumber from 'bignumber.js';
import { BytesLike } from 'ethers';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { MultichainProxyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { MultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/multichain-method-name';
import { MultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-trade';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

export class DexMultichainCrossChainTrade extends MultichainCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount,
        routerAddress: string,
        spenderAddress: string,
        multichainMethodName: MultichainMethodName,
        anyTokenAddress: string,
        onChainTrade?: EvmOnChainTrade | null
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new DexMultichainCrossChainTrade(
                    {
                        from,
                        to,
                        gasData: null,
                        priceImpact: 0,
                        toTokenAmountMin: new BigNumber(0),
                        feeInfo: {},
                        routerAddress,
                        spenderAddress,
                        routerMethodName: multichainMethodName,
                        anyTokenAddress,
                        onChainTrade: onChainTrade!,
                        slippage: 0
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

    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaMultichain'
            : 'startBridgeTokensViaMultichain';
    }

    public readonly onChainSubtype: OnChainSubtype;

    public readonly onChainTrade: EvmOnChainTrade | null;

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[
            this.from.blockchain as MultichainProxyCrossChainSupportedBlockchain
        ];
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
            slippage: number;
            onChainTrade: EvmOnChainTrade | null;
        },
        providerAddress: string
    ) {
        super(crossChainTrade, providerAddress);

        this.onChainSubtype = crossChainTrade.onChainTrade
            ? { from: crossChainTrade.onChainTrade.type, to: undefined }
            : { from: undefined, to: undefined };
        this.onChainTrade = crossChainTrade.onChainTrade;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const bridgeData = this.getBridgeData(options);
        const swapData = this.onChainTrade && (await this.getSwapData(options));
        const providerData = this.getProviderData('');

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

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

    protected getBridgeData(options: GetContractParamsOptions): unknown[] {
        const receiverAddress =
            this.to.blockchain === BLOCKCHAIN_NAME.BITCOIN
                ? EvmWeb3Pure.EMPTY_ADDRESS
                : options?.receiverAddress || this.walletAddress;
        const toChainId = blockchainId[this.to.blockchain];
        const fromToken = this.onChainTrade ? this.onChainTrade.to : this.from;
        const hasSwapBeforeBridge = this.onChainTrade !== null;

        return [
            EvmWeb3Pure.randomHex(32),
            `native:${this.type.toLowerCase()}`,
            this.providerAddress,
            EvmWeb3Pure.randomHex(20),
            fromToken.address,
            receiverAddress,
            fromToken.stringWeiAmount,
            toChainId,
            hasSwapBeforeBridge,
            false
        ];
    }

    protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
        const fromAddress =
            options.fromAddress || this.walletAddress || oneinchApiParams.nativeAddress;
        const swapData = await this.onChainTrade!.encode({
            fromAddress,
            receiverAddress: this.fromContractAddress
        });

        return [
            [
                swapData.to,
                swapData.to,
                this.from.address,
                this.onChainTrade!.to.address,
                this.from.stringWeiAmount,
                swapData.data,
                true
            ]
        ];
    }

    protected getProviderData(_sourceData: BytesLike): unknown[] {
        return [this.routerAddress];
    }
}
