import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import {
    DlnEvmOnChainSupportedBlockchain,
    DlnOnChainSupportedBlockchain
} from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnOnChainFactory } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/dln-on-chain-factory';
import { DlnOnChainSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-request';
import { DlnTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-trade-struct';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

export class DlnEvmOnChainTrade extends AggregatorEvmOnChainTrade {
    private readonly transactionRequest: DlnOnChainSwapRequest;

    public static async getGasLimit(
        tradeStruct: DlnTradeStruct<DlnEvmOnChainSupportedBlockchain>
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        const trade = DlnOnChainFactory.createTrade(
            fromBlockchain,
            tradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS
        ) as DlnEvmOnChainTrade;
        try {
            const transactionConfig = await trade.encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(
                fromBlockchain
            ) as EvmWeb3Public;
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (gasLimit?.isFinite()) {
                return gasLimit;
            }
        } catch {}

        return null;
    }

    public readonly providerGateway: string;

    public readonly type: OnChainTradeType;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    protected get spenderAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : this.providerGateway;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(
        tradeStruct: DlnTradeStruct<DlnOnChainSupportedBlockchain & EvmBlockchainName>,
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

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<GetToAmountAndTxDataResponse> {
        const params: DlnOnChainSwapRequest = {
            ...this.transactionRequest,
            tokenOutRecipient: options.receiverAddress || this.web3Private.address
        };

        try {
            const { tx, tokenOut } = await DlnApiService.fetchOnChainSwapData<EvmEncodeConfig>(
                params
            );

            return {
                tx,
                toAmount: tokenOut.amount
            };
        } catch (err) {
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        if (this.useProxy) {
            return this.encodeProxy(options);
        }
        return this.encodeDirect(options);
    }
}
