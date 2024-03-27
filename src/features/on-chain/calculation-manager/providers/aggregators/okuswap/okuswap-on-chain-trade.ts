import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { OkuQuoteRequestBody, OkuSwapRequestBody } from './models/okuswap-api-types';
import { OkuSwapSupportedBlockchain } from './models/okuswap-on-chain-supported-chains';
import { OkuSwapOnChainTradeStruct } from './models/okuswap-trade-types';
import { OkuSwapApiService } from './services/okuswap-api-service';

export class OkuSwapOnChainTrade extends AggregatorEvmOnChainTrade {
    /* @internal */
    public static async getGasLimit(
        tradeStruct: OkuSwapOnChainTradeStruct,
        providerGateway: string
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;

        if (!walletAddress) {
            return null;
        }

        const okuswapTrade = new OkuSwapOnChainTrade(
            tradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS,
            providerGateway
        );

        try {
            const transactionConfig = await okuswapTrade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                return gasLimit;
            }
        } catch {}

        try {
            const transactionData = await okuswapTrade.getTxConfigAndCheckAmount();

            if (transactionData.gas) {
                return new BigNumber(transactionData.gas);
            }
        } catch {}

        return null;
    }

    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.OKU_SWAP;

    private _okuSubProvider: string;

    private _quoteReqBody: OkuQuoteRequestBody;

    private _swapReqBody: OkuSwapRequestBody;

    protected readonly providerGateway: string;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    protected get fromBlockchain(): OkuSwapSupportedBlockchain {
        return this.from.blockchain as OkuSwapSupportedBlockchain;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(
        tradeStruct: OkuSwapOnChainTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);

        this.providerGateway = providerGateway;
        this._okuSubProvider = tradeStruct.subProvider;
        this._quoteReqBody = tradeStruct.quoteReqBody;
        this._swapReqBody = tradeStruct.swapReqBody;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                options.receiverAddress,
                options.fromAddress,
                options.directTransaction
            );

            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gas,
                gasPrice: transactionData.gasPrice
            });

            const value = this.getSwapValue(transactionData.value);

            return {
                to: transactionData.to,
                data: transactionData.data,
                value,
                gas,
                gasPrice
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            if (this.isDeflationError()) {
                throw new LowSlippageDeflationaryTokenError();
            }
            throw parseError(err);
        }
    }

    protected async getToAmountAndTxData(): Promise<GetToAmountAndTxDataResponse> {
        const [{ outAmount, estimatedGas }, evmConfig] = await Promise.all([
            OkuSwapApiService.makeQuoteRequest(this._okuSubProvider, this._quoteReqBody),
            OkuSwapApiService.makeSwapRequest(this._okuSubProvider, this._swapReqBody)
        ]);

        return {
            toAmount: Web3Pure.toWei(outAmount, this.to.decimals),
            tx: { ...evmConfig, gas: estimatedGas }
        };
    }
}
