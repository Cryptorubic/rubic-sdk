import BigNumber from 'bignumber.js';
import { RubicSdkError, SwapRequestError } from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { DlnEvmTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';
import {
    DlnEvmOnChainSupportedBlockchain,
    DlnOnChainSupportedBlockchain
} from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnOnChainFactory } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/dln-on-chain-factory';
import { DlnTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-trade-struct';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

export class DlnEvmOnChainTrade extends AggregatorEvmOnChainTrade {
    private readonly transactionRequest: TransactionRequest;

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
        try {
            const transactionData = await trade.getTxConfigAndCheckAmount();

            if (transactionData.gas) {
                return new BigNumber(transactionData.gas);
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
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
        this.type = tradeStruct.type;
        this.providerGateway = tradeStruct.providerGateway;
        this.transactionRequest = tradeStruct.transactionRequest;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

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

            if (err instanceof UpdatedRatesError || err instanceof RubicSdkError) {
                throw err;
            }
            throw new RubicSdkError('Can not encode trade');
        }
    }

    protected async getToAmountAndTxData(
        receiverAddress?: string,
        fromAddress?: string
    ): Promise<GetToAmountAndTxDataResponse> {
        const sameChain =
            BlockchainsInfo.getChainType(this.from.blockchain) ===
            BlockchainsInfo.getChainType(this.to.blockchain);
        const walletAddress = this.web3Private.address;
        const params = {
            ...this.transactionRequest,
            ...(receiverAddress && { dstChainTokenOutRecipient: receiverAddress }),
            // @TODO Check proxy when deBridge proxy returned
            senderAddress: fromAddress || walletAddress,
            srcChainRefundAddress: walletAddress,
            dstChainOrderAuthorityAddress: sameChain
                ? receiverAddress || walletAddress
                : receiverAddress!,
            srcChainOrderAuthorityAddress: sameChain
                ? receiverAddress || walletAddress
                : walletAddress,
            referralCode: '4350'
        };

        try {
            const { tx, estimation } = await DlnApiService.fetchSwapData<DlnEvmTransactionResponse>(
                params
            );

            return {
                tx,
                toAmount: estimation.dstChainTokenOut.maxTheoreticalAmount
            };
        } catch (err) {
            if ('statusCode' in err && 'message' in err) {
                throw new RubicSdkError(err.message);
            }
            throw err;
        }
    }
}
