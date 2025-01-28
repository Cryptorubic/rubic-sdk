import BigNumber from 'bignumber.js';
import { RubicSdkError, SwapRequestError } from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import {
    DlnEvmOnChainSupportedBlockchain,
    DlnOnChainSupportedBlockchain
} from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnOnChainSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-request';
import { DlnTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-trade-struct';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorSolanaOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-solana-on-chain-trade-abstract';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

export class DlnSolanaOnChainTrade extends AggregatorSolanaOnChainTrade {
    private readonly transactionRequest: DlnOnChainSwapRequest;

    public static async getGasLimit(
        _tradeStruct: DlnTradeStruct<DlnEvmOnChainSupportedBlockchain>
    ): Promise<BigNumber | null> {
        return null;
    }

    public readonly providerGateway: string;

    public readonly type: OnChainTradeType;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(
        tradeStruct: DlnTradeStruct<DlnOnChainSupportedBlockchain & SolanaBlockchainName>,
        providerAddress: string
    ) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            tokenAmount: tradeStruct.toTokenWeiAmountMin
        });
        this.type = tradeStruct.type;
        this.providerGateway = tradeStruct.providerGateway;
        this.transactionRequest = tradeStruct.transactionRequest;
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
                options.skipAmountCheck
            );

            return {
                data: transactionData.data,
                to: '',
                value: ''
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }

            if (err instanceof UpdatedRatesError || err instanceof RubicSdkError) {
                throw err;
            }
            throw new RubicSdkError('Can not encode trade');
        }
    }

    protected async getToAmountAndTxData(
        receiverAddress?: string,
        _fromAddress?: string
    ): Promise<EvmEncodedConfigAndToAmount> {
        const params: DlnOnChainSwapRequest = {
            ...this.transactionRequest,
            tokenOutRecipient: receiverAddress || this.web3Private.address
        };

        try {
            const { tx, tokenOut } = await DlnApiService.fetchOnChainSwapData(params);

            return {
                tx: {
                    data: tx.data,
                    value: '',
                    to: ''
                },
                toAmount: tokenOut.amount
            };
        } catch (err) {
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }
}
