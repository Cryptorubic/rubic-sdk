import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';

import { ON_CHAIN_TRADE_TYPE } from '../common/models/on-chain-trade-type';
import { EvmOnChainTrade } from '../common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OdosTradeStruct } from './model/odos-on-chain-trade-types';
import { OdosOnChainApiService } from './services/odos-on-chain-api-service';

export class OdosOnChainTrade extends EvmOnChainTrade {
    /* @internal */
    public static getGasLimit() {}

    public readonly type = ON_CHAIN_TRADE_TYPE.ODOS;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    private swapPathId: string;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(tradeStruct: OdosTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this._toTokenAmountMin = tradeStruct.to;
        this.swapPathId = tradeStruct.pathId;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        try {
            const transactionData = await this.getTransactionData(
                this.swapPathId,
                options.fromAddress
            );

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

    private async getTransactionData(
        pathId: string,
        fromAddress?: string
    ): Promise<EvmEncodeConfig> {
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
