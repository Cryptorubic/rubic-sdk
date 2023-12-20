import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';

import { ON_CHAIN_TRADE_TYPE } from '../common/models/on-chain-trade-type';
import { EvmOnChainTrade } from '../common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OdosBestRouteRequestBody } from './model/odos-api-best-route-types';
import { OdosOnChainTradeStruct } from './model/odos-on-chain-trade-types';
import { OdosOnChainApiService } from './services/odos-on-chain-api-service';

export class OdosOnChainTrade extends EvmOnChainTrade {
    /* @internal */
    public static async getGasLimit(
        tradeStruct: OdosOnChainTradeStruct,
        providerGateway: string
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;

        if (!walletAddress) {
            return null;
        }

        const odosTrade = new OdosOnChainTrade(
            tradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS,
            providerGateway
        );
        try {
            const transactionConfig = await odosTrade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                return gasLimit;
            }
        } catch {}
        try {
            const transactionData = await odosTrade.getTransactionData();

            if (transactionData.gas) {
                return new BigNumber(transactionData.gas);
            }
        } catch {}
        return null;
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.ODOS;

    public readonly providerGateway: string;

    private bestRouteRequestBody: OdosBestRouteRequestBody;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    protected get spenderAddress(): string {
        // @TODO - set back proxy-handling when odos adds receiverAddress property in request body
        return this.providerGateway;
        // return this.useProxy
        //     ? rubicProxyContractAddress[this.from.blockchain].gateway
        //     : this.providerGateway;
    }

    constructor(
        tradeStruct: OdosOnChainTradeStruct,
        providerAddress: string,
        providerGateway: string
    ) {
        super(tradeStruct, providerAddress);
        this.bestRouteRequestBody = tradeStruct.bestRouteRequestBody;
        this.providerGateway = providerGateway;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        try {
            const transactionData = await this.getTransactionData(options.fromAddress);

            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gas,
                gasPrice: transactionData.gasPrice
            });

            return {
                to: transactionData.to,
                data: transactionData.data,
                value: this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
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

    private async getTransactionData(fromAddress?: string): Promise<EvmEncodeConfig> {
        const { pathId } = await OdosOnChainApiService.getBestRoute(this.bestRouteRequestBody);

        const { transaction: tx } = await OdosOnChainApiService.getSwapTx({
            userAddr: fromAddress || this.walletAddress,
            pathId
        });

        if (!tx) {
            throw new RubicSdkError(`Transaction status is undefined!`);
        }

        const gasLimit = String(tx.gas) && parseInt(String(tx.gas), 16).toString();
        const gasPrice = String(tx.gasPrice) && parseInt(String(tx.gasPrice), 16).toString();

        return {
            data: tx.data,
            to: tx.to,
            value: tx.value,
            gas: gasLimit,
            gasPrice: gasPrice!
        };
    }
}
