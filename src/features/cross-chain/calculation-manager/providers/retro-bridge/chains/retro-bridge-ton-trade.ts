import BigNumber from 'bignumber.js';
import { WrongReceiverAddressError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ChainType } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TonCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/ton-cross-chain-trade/ton-cross-chain-trade';
import { retroBridgeContractAddresses } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/constants/retro-bridge-contract-address';
import { RetroBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/constants/retro-bridge-supported-blockchain';
import { RetroBridgeTonConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/models/retro-bridge-constructor-params';
import {
    RetroBridgeQuoteSendParams,
    RetroBridgeTxResponse
} from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/models/retro-bridge-quote-send-params';
import { RetroBridgeApiService } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/services/retro-bridge-api-service';

export class RetroBridgeTonTrade extends TonCrossChainTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE;

    public readonly isAggregator = false;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<TonBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.RETRO_BRIDGE;

    public readonly gasData: null;

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
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : retroBridgeContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    private get chainType(): ChainType {
        return BlockchainsInfo.getChainType(this.fromBlockchain);
    }

    constructor(
        crossChainTrade: RetroBridgeTonConstructorParams,
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath, false);
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

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        // const needAuthWallet = await this.needAuthWallet();
        // if (needAuthWallet) {
        //     throw new RubicSdkError('Need to authorize the wallet via authWallet method');
        // }
        if (!receiverAddress) {
            throw new WrongReceiverAddressError();
        }

        let retroBridgeOrder: RetroBridgeTxResponse = {
            hot_wallet_address: this.hotWalletAddress,
            transaction_id: ''
        };

        if (!this.isSimulation) {
            retroBridgeOrder = await RetroBridgeApiService.createTransaction(
                {
                    ...this.quoteSendParams,
                    receiver_wallet: receiverAddress,
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

        // const config = this.createTonConfig(
        //     fromWithoutFee.stringWeiAmount,
        //     retroBridgeOrder.hot_wallet_address
        // );

        return { config: { to: '', data: '', value: '' }, amount: this.to.stringWeiAmount };
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

    public async needAuthWallet(): Promise<boolean> {
        try {
            const msg = await RetroBridgeApiService.checkWallet(this.walletAddress, this.chainType);

            return msg.toLowerCase() !== 'success';
        } catch {
            return true;
        }
    }

    public async authWallet(): Promise<never | void> {
        // const signData = await RetroBridgeApiService.getMessageToAuthWallet();
        // const signMessage = `${signData}\n${this.walletAddress}`;
        // const signature = await this.web3Private.signMessage(signMessage);
        // await RetroBridgeApiService.sendSignedMessage(
        //     this.walletAddress,
        //     signature,
        //     this.chainType
        // );
    }

    swap(_options: SwapTransactionOptions | undefined): Promise<string> {
        return Promise.resolve('');
    }

    protected getContractParams(
        _options: GetContractParamsOptions,
        _skipAmountChangeCheck?: boolean
    ): Promise<ContractParams> {
        throw new Error('Not implemented');
    }
}
