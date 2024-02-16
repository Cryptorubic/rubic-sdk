import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { GasPriceBN } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { convertGasDataToBN } from '../../utils/convert-gas-price';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { OrbiterQuoteConfig } from './models/orbiter-api-quote-types';
import { OrbiterGetGasDataParams, OrbiterTradeParams } from './models/orbiter-bridge-trade-types';
import { orbiterContractAddresses } from './models/orbiter-contract-addresses';
import { OrbiterSupportedBlockchain } from './models/orbiter-supported-blockchains';
import { OrbiterUtils } from './services/orbiter-utils';

export class OrbiterBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData({
        fromToken,
        toToken,
        feeInfo,
        receiverAddress,
        providerAddress,
        quoteConfig
    }: OrbiterGetGasDataParams): Promise<GasData | null> {
        const fromBlockchain = fromToken.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;

        if (!walletAddress) {
            return null;
        }

        try {
            let gasLimit: BigNumber | null;
            let gasDetails: GasPriceBN | BigNumber | null;
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

            const tradeParams = {
                crossChainTrade: {
                    from: fromToken,
                    to: toToken,
                    feeInfo,
                    gasData: null,
                    priceImpact: fromToken.calculatePriceImpactPercent(toToken) || 0,
                    quoteConfig
                },
                routePath: [],
                providerAddress
            } as OrbiterTradeParams;

            if (feeInfo.rubicProxy?.fixedFee?.amount.gt(0)) {
                const { contractAddress, contractAbi, methodName, methodArguments, value } =
                    await new OrbiterBridgeTrade(tradeParams).getContractParams({
                        receiverAddress
                    });

                const [proxyGasLimit, proxyGasDetails] = await Promise.all([
                    web3Public.getEstimatedGas(
                        contractAbi,
                        contractAddress,
                        methodName,
                        methodArguments,
                        walletAddress,
                        value
                    ),
                    convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(fromBlockchain))
                ]);

                gasLimit = proxyGasLimit;
                gasDetails = proxyGasDetails;
            } else {
                const { data, value, to } = await new OrbiterBridgeTrade(
                    tradeParams
                ).callOrbiterContract();

                const defaultGasLimit = await web3Public.getEstimatedGasByData(walletAddress, to, {
                    data,
                    value
                });
                const defaultGasDetails = convertGasDataToBN(
                    await Injector.gasPriceApi.getGasPrice(fromBlockchain)
                );

                gasLimit = defaultGasLimit;
                gasDetails = defaultGasDetails;
            }

            if (!gasLimit?.isFinite()) {
                return null;
            }

            const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);
            return {
                gasLimit: increasedGasLimit,
                ...gasDetails
            };
        } catch (err) {
            return null;
        }
    }

    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ORBITER_BRIDGE;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;
    /** */

    /* used to get extraNativeFee(tradeFee) and orbiter contract params */
    private quoteConfig: OrbiterQuoteConfig;

    private get fromBlockchain(): OrbiterSupportedBlockchain {
        return this.from.blockchain as OrbiterSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : orbiterContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: OrbiterTradeParams) {
        super(params.providerAddress, params.routePath);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.to.tokenAmount;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.quoteConfig = params.crossChainTrade.quoteConfig;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const { data, to, value } = await this.callOrbiterContract(options.directTransaction);

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;

        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.callOrbiterContract(options.directTransaction);

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: receiverAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `native:${this.bridgeType}`,
            fromAddress: this.walletAddress
        });

        const extraNativeFee = this.quoteConfig.tradeFee;

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
            this.from.blockchain,
            providerRouter,
            extraNativeFee
        );

        const methodArguments = [bridgeData, providerData];
        const value = this.getSwapValue(providerValue);

        const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            evmCommonCrossChainAbi,
            this.methodName,
            methodArguments,
            value
        );

        const sendingToken = this.from.isNative ? [] : [this.from.address];
        const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
            contractAbi: gatewayRubicCrossChainAbi,
            methodName: 'startViaRubic',
            methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
            value
        };
    }

    private async callOrbiterContract(
        transactionConfig?: EvmEncodeConfig
    ): Promise<EvmEncodeConfig> {
        if (transactionConfig) {
            return {
                data: transactionConfig.data,
                to: transactionConfig.to,
                value: transactionConfig.value
            };
        }
        const contractAddress = this.quoteConfig.endpoint;
        const value = OrbiterUtils.getTransferAmount(this.from.stringWeiAmount, this.quoteConfig);

        if (this.from.isNative) {
            return {
                data: '0x',
                to: contractAddress,
                value
            };
        }

        const config = EvmWeb3Pure.encodeMethodCall(
            this.from.address,
            ERC20_TOKEN_ABI,
            'transfer',
            [contractAddress, value],
            '0'
        );

        return {
            to: config.to,
            value: config.value,
            data: config.data
        };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
