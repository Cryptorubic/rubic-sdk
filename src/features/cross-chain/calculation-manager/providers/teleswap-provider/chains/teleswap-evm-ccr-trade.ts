import { TeleswapSDK } from '@teleportdao/teleswap-sdk';
import { SupportedNetwork } from '@teleportdao/teleswap-sdk/dist/types';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { ContractParams } from 'src/features/common/models/contract-params';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from '../../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../../common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../../common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { GetContractParamsOptions } from '../../common/models/get-contract-params-options';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { TradeInfo } from '../../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    teleSwapBaseChains,
    TeleSwapCcrBaseChain,
    TeleSwapCcrSupportedChain
} from '../constants/teleswap-ccr-supported-chains';
import { teleSwapContractAddresses } from '../constants/teleswap-contract-address';
import { teleSwapNetworkTickers } from '../constants/teleswap-network-tickers';
import {
    teleswapSwapAndUnwrapAbi,
    teleswapSwapAndUwrapAbiForCcrChains
} from '../constants/teleswap-swap-and-unwrap-abi';
import { TeleSwapEvmConstructorParams } from '../models/teleswap-constructor-params';
import { TeleSwapUtilsService } from '../services/teleswap-utils-service';

export class TeleSwapEvmCcrTrade extends EvmCrossChainTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.TELE_SWAP;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    private readonly fromWithoutFee: PriceTokenAmount<BlockchainName>;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.TELE_SWAP;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    public readonly isAggregator = false;

    private readonly teleSwapSdk: TeleswapSDK;

    private get fromBlockchain(): TeleSwapCcrSupportedChain {
        return this.from.blockchain as TeleSwapCcrSupportedChain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : teleSwapContractAddresses[this.fromBlockchain]!;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: TeleSwapEvmConstructorParams) {
        const { routePath, useProxy, crossChainTrade, providerAddress } = params;
        const percentFeeAddress = TeleSwapUtilsService.getFeePercentAddressEVM(
            params.crossChainTrade.from,
            providerAddress
        );
        super(percentFeeAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - this.slippage);
        this.teleSwapSdk = params.crossChainTrade.teleSwapSdk;
        this.fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
    }

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );

        const isEvmDestination = BlockchainsInfo.isEvmBlockchainName(this.to.blockchain);
        const receivingAsset = isEvmDestination ? this.to.address : this.from.address;

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: 'teleswap',
            fromAddress: this.walletAddress,
            toAddress: receivingAsset
        });

        const extraNativeFee = this.from.isNative
            ? new BigNumber(providerValue).minus(this.fromWithoutFee.stringWeiAmount).toFixed()
            : new BigNumber(providerValue).toFixed();

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
            this.fromBlockchain as EvmBlockchainName,
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

    protected async getTransactionConfigAndAmount(
        receiverAddress: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const fromTokenAddress = TeleSwapUtilsService.getTokenAddress(this.from);

        const swapParams = await this.teleSwapSdk.swapAndUnwrapInputs(
            {
                inputAmount: this.fromWithoutFee.stringWeiAmount,
                ...(fromTokenAddress && { inputToken: fromTokenAddress })
            },
            receiverAddress,
            teleSwapNetworkTickers[this.fromBlockchain] as SupportedNetwork,
            this.toTokenAmountMin.toFixed()
        );

        const isFromBaseChain = teleSwapBaseChains.includes(
            this.fromBlockchain as TeleSwapCcrBaseChain
        );

        const args = this.getTxParams(swapParams.inputs.params, isFromBaseChain);

        const evmConfig = EvmWeb3Pure.encodeMethodCall(
            teleSwapContractAddresses[this.fromBlockchain]!,
            isFromBaseChain ? teleswapSwapAndUnwrapAbi : teleswapSwapAndUwrapAbiForCcrChains,
            'swapAndUnwrap',
            args,
            this.from.isNative ? swapParams.inputs.value : '0'
        );

        return { config: evmConfig, amount: this.to.stringWeiAmount };
    }

    private getTxParams(args: unknown[], isFromBaseChain: boolean): unknown[] {
        const toTokenAmountIndex = isFromBaseChain ? 1 : 2;

        const toTokenMinWeiAmount = Web3Pure.toWei(
            (args[toTokenAmountIndex] as string[])[1]!,
            this.to.decimals
        );
        (args[toTokenAmountIndex] as string[])[1] = toTokenMinWeiAmount;

        return args;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
