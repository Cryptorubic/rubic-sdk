import BigNumber from 'bignumber.js';
import { RubicSdkError, SwapRequestError } from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import {
    DlnEvmOnChainSupportedBlockchain,
    DlnOnChainSupportedBlockchain
} from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnOnChainSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-request';
import { DlnTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-trade-struct';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AggregatorSolanaOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-solana-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';

export class DlnSolanaOnChainTrade extends AggregatorSolanaOnChainTrade {
    private readonly transactionRequest: DlnOnChainSwapRequest;

    public static async getGasLimit(
        _tradeStruct: DlnTradeStruct<DlnEvmOnChainSupportedBlockchain>
    ): Promise<BigNumber | null> {
        return null;
        // const fromBlockchain = tradeStruct.from.blockchain;
        // const walletAddress =
        //     Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        // if (!walletAddress) {
        //     return null;
        // }
        //
        // const trade = DlnOnChainFactory.createTrade(
        //     fromBlockchain,
        //     tradeStruct,
        //     EvmWeb3Pure.EMPTY_ADDRESS
        // ) as DlnSolanamOnChainTrade;
        // try {
        //     const transactionConfig = await trade.encode({ fromAddress: walletAddress });
        //
        //     const web3Public = Injector.web3PublicService.getWeb3Public(
        //         fromBlockchain
        //     ) as EvmWeb3Public;
        //     const gasLimit = (
        //         await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
        //     )[0];
        //
        //     if (gasLimit?.isFinite()) {
        //         return gasLimit;
        //     }
        // } catch {}
        // try {
        //     const transactionData = await trade.getTxConfigAndCheckAmount();
        //
        //     if (transactionData.gas) {
        //         return new BigNumber(transactionData.gas);
        //     }
        // } catch {}
        //
        // return null;
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
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                options.receiverAddress,
                options.fromAddress,
                options.directTransaction
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
    ): Promise<GetToAmountAndTxDataResponse> {
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
