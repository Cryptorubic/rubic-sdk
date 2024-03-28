import BigNumber from 'bignumber.js';
import { Cache } from 'src/common/utils/decorators';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    XY_API_ENDPOINT,
    XY_NATIVE_ADDRESS
} from 'src/features/common/providers/xy/constants/xy-api-params';
import { XyBuildTxRequest } from 'src/features/common/providers/xy/models/xy-build-tx-request';
import { XyBuildTxResponse } from 'src/features/common/providers/xy/models/xy-build-tx-response';
import { xyAnalyzeStatusCode } from 'src/features/common/providers/xy/utils/xy-utils';
import { XyDexTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/xy-dex/models/xy-dex-trade-struct';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

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
            srcSwapProvider: this.provider
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
}
