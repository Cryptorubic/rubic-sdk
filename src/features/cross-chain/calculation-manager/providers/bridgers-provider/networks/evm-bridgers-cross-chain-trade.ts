import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { NotSupportedRegionError } from 'src/common/errors/swap/not-supported-region';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { bridgersContractAddresses } from 'src/features/common/providers/bridgers/models/bridgers-contract-addresses';
import {
    BridgersQuoteRequest,
    BridgersQuoteResponse
} from 'src/features/common/providers/bridgers/models/bridgers-quote-api';
import {
    BridgersSwapRequest,
    BridgersSwapResponse
} from 'src/features/common/providers/bridgers/models/bridgers-swap-api';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { BridgersEvmCrossChainParams } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/bridgers-cross-chain-trade-types';
import { EvmBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/evm-bridgers-transaction-data';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { MarkRequired } from 'ts-essentials';

export class EvmBridgersCrossChainTrade extends EvmCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.BRIDGERS;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : bridgersContractAddresses[
                  this.from.blockchain as BridgersCrossChainSupportedBlockchain
              ];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: BridgersEvmCrossChainParams) {
        const { crossChainTrade, providerAddress, routePath, useProxy } = params;
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
        this.slippage = crossChainTrade.slippage;
    }

    protected async getContractParams(
        options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
    ): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );

        const isEvmDestination = BlockchainsInfo.isEvmBlockchainName(this.to.blockchain);
        let receiverAddress = isEvmDestination
            ? options.receiverAddress || this.walletAddress
            : options.receiverAddress;
        let toAddress = this.to.address;

        if (this.to.blockchain === BLOCKCHAIN_NAME.TRON) {
            receiverAddress = TronWeb3Pure.addressToHex(receiverAddress);
            toAddress = TronWeb3Pure.addressToHex(toAddress);
        }
        if (this.to.blockchain === BLOCKCHAIN_NAME.TON && !this.to.isNative) {
            receiverAddress = TonWeb3Pure.addressToHex(receiverAddress);
            toAddress = TonWeb3Pure.addressToHex(toAddress);
        }

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
            { ...options, receiverAddress },
            {
                walletAddress: this.walletAddress,
                fromTokenAmount: this.from,
                toTokenAmount: this.to,
                toAddress,
                srcChainTrade: null,
                providerAddress: this.providerAddress,
                type: `native:${this.type}`,
                fromAddress: this.walletAddress
            }
        );

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            to!,
            data! as string,
            this.from.blockchain as EvmBlockchainName,
            to,
            '0'
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

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmBridgersTransactionData; amount: string }> {
        const fromBlockchain = this.from.blockchain as BridgersCrossChainSupportedBlockchain;
        const toBlockchain = this.to.blockchain as BridgersCrossChainSupportedBlockchain;

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
        const amountOutMin = Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals);

        const fromTokenAddress = createTokenNativeAddressProxy(
            fromWithoutFee,
            bridgersNativeAddress,
            true
        ).address;

        const useLowerCase = BlockchainsInfo.isEvmBlockchainName(this.to.blockchain);
        const toTokenAddress = createTokenNativeAddressProxy(
            this.to,
            bridgersNativeAddress,
            useLowerCase
        ).address;

        const fromAddress = this.walletAddress;
        const swapRequest: BridgersSwapRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromAddress,
            toAddress: receiverAddress!,
            fromTokenChain: toBridgersBlockchain[fromBlockchain],
            toTokenChain: toBridgersBlockchain[toBlockchain],
            fromTokenAmount: fromWithoutFee.stringWeiAmount,
            amountOutMin,
            equipmentNo: fromAddress.slice(0, 32),
            sourceFlag: 'rubic'
        };

        const swapData = await Injector.httpClient.post<
            BridgersSwapResponse<EvmBridgersTransactionData>
        >('https://sswap.swft.pro/api/sswap/swap', swapRequest);
        if (swapData.resCode === 1146) {
            throw new NotSupportedRegionError();
        }
        if (!swapData.data?.txData) {
            throw new NotSupportedTokensError();
        }

        const config = swapData.data?.txData;

        const quoteRequest: BridgersQuoteRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromTokenAmount: fromWithoutFee.stringWeiAmount,
            fromTokenChain: toBridgersBlockchain[fromBlockchain],
            toTokenChain: toBridgersBlockchain[toBlockchain]
        };
        const quoteResponse = await Injector.httpClient.post<BridgersQuoteResponse>(
            'https://sswap.swft.pro/api/sswap/quote',
            quoteRequest
        );
        const amount = quoteResponse.data?.txData?.amountOutMin;

        return { config, amount };
    }
}
