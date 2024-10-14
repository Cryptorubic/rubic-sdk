import BigNumber from 'bignumber.js';
import { NotWhitelistedProviderError } from 'src/common/errors';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Cache } from 'src/common/utils/decorators';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    XY_AFFILIATE_ADDRESS,
    XY_API_ENDPOINT,
    XY_NATIVE_ADDRESS
} from 'src/features/common/providers/xy/constants/xy-api-params';
import { XyBuildTxRequest } from 'src/features/common/providers/xy/models/xy-build-tx-request';
import { XyBuildTxResponse } from 'src/features/common/providers/xy/models/xy-build-tx-response';
import { xyAnalyzeStatusCode } from 'src/features/common/providers/xy/utils/xy-utils';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { XyDexTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/xy-dex/models/xy-dex-trade-struct';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

import { EvmOnChainTrade } from '../../common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class XyDexTrade extends AggregatorEvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(tradeStruct: XyDexTradeStruct): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new XyDexTrade(
                tradeStruct,
                EvmWeb3Pure.EMPTY_ADDRESS
            ).encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (!gasLimit?.isFinite()) {
                return null;
            }
            return gasLimit;
        } catch (_err) {
            return null;
        }
    }

    public readonly dexContractAddress: string;

    public type = ON_CHAIN_TRADE_TYPE.XY_DEX;

    private readonly provider: string;

    constructor(tradeStruct: XyDexTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.dexContractAddress = tradeStruct.contractAddress;
        this.provider = tradeStruct.provider;
    }

    public async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<GetToAmountAndTxDataResponse> {
        const receiver = options.receiverAddress || this.walletAddress;

        const chainId = blockchainId[this.from.blockchain];
        const srcQuoteTokenAddress = this.from.isNative ? XY_NATIVE_ADDRESS : this.from.address;
        const dstQuoteTokenAddress = this.to.isNative ? XY_NATIVE_ADDRESS : this.to.address;

        const quoteTradeParams: XyBuildTxRequest = {
            srcChainId: chainId,
            srcQuoteTokenAddress,
            srcQuoteTokenAmount: this.from.stringWeiAmount,
            dstChainId: chainId,
            dstQuoteTokenAddress,
            slippage: this.slippageTolerance * 100,
            receiver,
            srcSwapProvider: this.provider,
            affiliate: XY_AFFILIATE_ADDRESS
        };

        const tradeData = await this.getResponseFromApiToTransactionRequest(quoteTradeParams);

        if (!tradeData.success) {
            xyAnalyzeStatusCode(tradeData.errorCode, tradeData.errorMsg);
        }

        return { tx: tradeData.tx, toAmount: tradeData.route.dstQuoteTokenAmount };
    }

    @Cache({
        maxAge: 15_000
    })
    private async getResponseFromApiToTransactionRequest(
        params: XyBuildTxRequest
    ): Promise<XyBuildTxResponse> {
        return Injector.httpClient.get<XyBuildTxResponse>(`${XY_API_ENDPOINT}/buildTx`, {
            params: { ...params }
        });
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            const transactionData = await this.setTransactionConfig(options);

            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gas,
                gasPrice: transactionData.gasPrice
            });

            return {
                to: transactionData.to,
                data: transactionData.data,
                value: transactionData.value,
                gas,
                gasPrice
            };
        } catch (err) {
            throw this.getSwapError(err);
        }
    }

    protected async getProxyContractParams(
        options: EncodeTransactionOptions
    ): Promise<ContractParams> {
        const swapData = await this.getSwapData(options);

        const { value: providerValue } = await this.encodeDirect({
            ...options,
            fromAddress: rubicProxyContractAddress[this.from.blockchain].router,
            supportFee: false,
            receiverAddress: rubicProxyContractAddress[this.from.blockchain].router
        });
        const receiverAddress = options.receiverAddress || options.fromAddress;
        const methodArguments = [
            EvmWeb3Pure.randomHex(32),
            this.providerAddress,
            EvmOnChainTrade.getReferrerAddress(options.referrer),
            receiverAddress,
            this.toTokenAmountMin.stringWeiAmount,
            swapData
        ];

        const nativeToken = nativeTokensList[this.from.blockchain];
        const proxyFee = new BigNumber(this.feeInfo.rubicProxy?.fixedFee?.amount || '0');
        const providerValueAmount = Web3Pure.fromWei(providerValue, nativeToken.decimals);

        const value = Web3Pure.toWei(proxyFee.plus(providerValueAmount), nativeToken.decimals);

        const txConfig = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            evmCommonCrossChainAbi,
            'swapTokensGeneric',
            methodArguments,
            value
        );

        const sendingToken = this.from.isNative ? [] : [this.from.address];
        const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
            contractAbi: gatewayRubicCrossChainAbi,
            methodName: 'startViaRubic',
            methodArguments: [sendingToken, sendingAmount, txConfig.data],
            value
        };
    }

    protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
        const directTransactionConfig = await this.encodeDirect({
            ...options,
            fromAddress: rubicProxyContractAddress[this.from.blockchain].router,
            supportFee: false,
            receiverAddress: rubicProxyContractAddress[this.from.blockchain].router
        });
        const availableDexs = (
            await ProxyCrossChainEvmTrade.getWhitelistedDexes(this.from.blockchain)
        ).map(address => address.toLowerCase());

        const routerAddress = directTransactionConfig.to;
        const method = directTransactionConfig.data.slice(0, 10);

        if (!availableDexs.includes(routerAddress.toLowerCase())) {
            throw new NotWhitelistedProviderError(routerAddress, undefined, 'dex');
        }
        await ProxyCrossChainEvmTrade.checkDexWhiteList(
            this.from.blockchain,
            routerAddress,
            method
        );

        return [
            [
                routerAddress,
                routerAddress,
                this.from.address,
                this.to.address,
                this.from.isNative ? directTransactionConfig.value : this.from.stringWeiAmount,
                directTransactionConfig.data,
                true
            ]
        ];
    }
}
