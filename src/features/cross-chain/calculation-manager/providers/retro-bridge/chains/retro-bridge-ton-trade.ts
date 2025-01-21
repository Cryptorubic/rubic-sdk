import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { RubicSdkError, WrongReceiverAddressError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ChainType } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TonCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/ton-cross-chain-trade/ton-cross-chain-trade';
import { RetroBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/constants/retro-bridge-supported-blockchain';
import { RetroBridgeTonConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/models/retro-bridge-constructor-params';
import {
    RetroBridgeQuoteSendParams,
    RetroBridgeTxResponse
} from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/models/retro-bridge-quote-send-params';
import { RetroBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/models/retro-bridge-trade';
import { RetroBridgeApiService } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/services/retro-bridge-api-service';

export class RetroBridgeTonTrade extends TonCrossChainTrade implements RetroBridgeTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE;

    public readonly isAggregator = false;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<TonBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.RETRO_BRIDGE;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    public readonly slippage: number;

    private readonly quoteSendParams: RetroBridgeQuoteSendParams;

    private readonly isSimulation: boolean;

    private readonly hotWalletAddress: string;

    public retroBridgeId = '';

    private get fromBlockchain(): RetroBridgeSupportedBlockchain {
        return this.from.blockchain as RetroBridgeSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        throw new Error('Not implemented');
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    private get chainType(): ChainType {
        return BlockchainsInfo.getChainType(this.fromBlockchain);
    }

    constructor(
        crossChainTrade: RetroBridgeTonConstructorParams,
        providerAddress: string,
        routePath: RubicStep[],
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, false, apiQuote, apiResponse);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.quoteSendParams = crossChainTrade.quoteSendParams;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.hotWalletAddress = crossChainTrade.hotWalletAddress;
        this.isSimulation = crossChainTrade.isSimulation ? crossChainTrade.isSimulation : false;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    // @TODO API

    public async swap(options: SwapTransactionOptions | undefined): Promise<string> {
        if (!options?.receiverAddress) {
            throw new WrongReceiverAddressError();
        }

        const needAuthWallet = await this.needAuthWallet();
        if (needAuthWallet) {
            throw new RubicSdkError('Need to authorize the wallet via authWallet method');
        }

        let retroBridgeOrder: RetroBridgeTxResponse = {
            hot_wallet_address: this.hotWalletAddress,
            transaction_id: ''
        };

        if (!this.isSimulation) {
            retroBridgeOrder = await RetroBridgeApiService.createTransaction(
                {
                    ...this.quoteSendParams,
                    receiver_wallet: options.receiverAddress,
                    sender_wallet: this.walletAddress
                },
                this.chainType
            );

            this.retroBridgeId = retroBridgeOrder.transaction_id;
        }

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        return this.web3Private.transferAsset(
            this.from.address,
            this.walletAddress,
            this.hotWalletAddress,
            fromWithoutFee.stringWeiAmount,
            options?.onConfirm ? { onTransactionHash: options.onConfirm } : {}
        );
    }

    public async needAuthWallet(): Promise<boolean> {
        try {
            const addresses = await TonWeb3Pure.getAllFormatsOfAddress(this.walletAddress);
            const msg = await RetroBridgeApiService.checkWallet(addresses.raw_form, this.chainType);

            return msg.toLowerCase() !== 'success';
        } catch {
            return true;
        }
    }

    public async authWallet(): Promise<never | void> {
        console.error('Wallet should be authenticated on connection stage');
    }

    protected getTransactionConfigAndAmount(
        _receiverAddress?: string
    ): Promise<{ config: any; amount: string }> {
        // @TODO API
        throw new Error('NOT IMPLEMENTED');
    }
}
