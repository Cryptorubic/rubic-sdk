import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../common/models/on-chain-trade-type';
import { EvmOnChainTrade } from '../common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { RangoOnChainTradeStruct } from './models/rango-on-chain-trade-types';
import { RangoOnChainApiService } from './services/rango-on-chain-api-service';

export class RangoOnChainTrade extends EvmOnChainTrade {
    /* @internal */
    public static async getGasLimit(
        tradeStruct: RangoOnChainTradeStruct
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;

        if (!walletAddress) {
            return null;
        }

        const rangoTrade = new RangoOnChainTrade(tradeStruct, EvmWeb3Pure.EMPTY_ADDRESS);
        try {
            const transactionConfig = await rangoTrade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                return gasLimit;
            }
        } catch {}
        try {
            const transactionData = await rangoTrade.getTransactionData();

            if (transactionData.gas) {
                return new BigNumber(transactionData.gas);
            }
        } catch {}
        return null;
    }

    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.RANGO;

    public readonly _toTokenAmountMin: PriceTokenAmount;

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    constructor(tradeStruct: RangoOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            const transactionData = await this.getTransactionData();
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

    private async getTransactionData(): Promise<EvmEncodeConfig> {
        // @QUESTION mb here needs add params fromAddress: options.fromAddress and receiverAddress: options.receiverAddress
        const params = await RangoCommonParser.getSwapQueryParams(this.from, this.to, {
            slippageTolerance: this.slippageTolerance
        });

        const { tx } = await RangoOnChainApiService.getSwapTransaction(params);

        if (!tx) {
            throw new RubicSdkError(`Transaction status is undefined!`);
        }

        const gasLimit = tx.gasLimit && parseInt(tx.gasLimit, 16).toString();
        const gasPrice = tx.gasPrice && parseInt(tx.gasPrice, 16).toString();

        return {
            data: tx.txData!,
            to: tx.txTo,
            value: tx.value!,
            gas: gasLimit!,
            gasPrice: gasPrice!
        };
    }
}
