import { PriceTokenAmount, Token } from 'src/common/tokens';
import { TronOnChainTrade } from 'src/features/on-chain/providers/abstract/on-chain-trade/tron-on-chain-trade/tron-on-chain-trade';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/providers/models/on-chain-trade-type';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { createTokenNativeAddressProxy } from 'src/features/on-chain/providers/dexes/abstract/utils/token-native-address-proxy';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { Injector } from 'src/core/injector/injector';
import { TronBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-provider/tron-bridgers-trade/models/tron-bridgers-transaction-data';
import { SwapRequestError } from 'src/common/errors';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import {
    BridgersSwapRequest,
    BridgersSwapResponse
} from 'src/features/common/providers/bridgers/models/bridgers-swap-api';

export class BridgersTrade extends TronOnChainTrade {
    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly to: PriceTokenAmount<TronBlockchainName>;

    public readonly path: ReadonlyArray<Token> = [];

    public readonly slippageTolerance: number;

    protected readonly contractAddress: string;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BRIDGERS;
    }

    constructor(tradeStruct: {
        from: PriceTokenAmount<TronBlockchainName>;
        to: PriceTokenAmount<TronBlockchainName>;
        slippageTolerance: number;
        contractAddress: string;
    }) {
        super();

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.contractAddress = tradeStruct.contractAddress;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState();
        await this.checkAllowanceAndApprove(options);

        try {
            const transactionData = await this.getTransactionData(options);

            return await this.web3Private.triggerContract(
                this.contractAddress,
                transactionData.functionName,
                transactionData.parameter,
                { ...transactionData.options, onTransactionHash: options.onConfirm }
            );
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw err;
        }
    }

    public async encode(options: EncodeTransactionOptions): Promise<TronTransactionConfig> {
        try {
            const transactionData = await this.getTransactionData(options);
            const encodedData = TronWeb3Pure.encodeMethodSignature(
                transactionData.functionName,
                transactionData.parameter
            );

            return {
                to: this.contractAddress,
                data: encodedData,
                callValue: transactionData.options.callValue,
                feeLimit: options.feeLimit || transactionData.options.feeLimit
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            throw err;
        }
    }

    private async getTransactionData(options: {
        fromAddress?: string;
        receiverAddress?: string;
    }): Promise<TronBridgersTransactionData> {
        const fromTokenAddress = createTokenNativeAddressProxy(
            this.from,
            bridgersNativeAddress
        ).address;
        const toTokenAddress = createTokenNativeAddressProxy(
            this.to,
            bridgersNativeAddress
        ).address;

        const fromAddress = options.fromAddress || this.walletAddress;
        const toAddress = options.receiverAddress || fromAddress;

        const amountOutMin = this.toTokenAmountMin.stringWeiAmount;

        const swapRequest: BridgersSwapRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromAddress,
            toAddress,
            fromTokenChain: toBridgersBlockchain[this.from.blockchain],
            toTokenChain: toBridgersBlockchain[this.to.blockchain],
            fromTokenAmount: this.from.stringWeiAmount,
            amountOutMin,
            equipmentNo: fromAddress.slice(0, 32),
            sourceFlag: 'rubic_widget'
        };

        const swapData = await Injector.httpClient.post<
            BridgersSwapResponse<TronBridgersTransactionData>
        >('https://sswap.swft.pro/api/sswap/swap', swapRequest);
        return swapData.data.txData;
    }
}
