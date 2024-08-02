import { Web3Provider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ChainType } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { RetroBridgeSupportedBlockchain } from './constants/retro-bridge-supported-blockchain';
import { RetroBridgeQuoteSendParams } from './models/retro-bridge-quote-send-params';
import { RetroBridgeApiService } from './services/retro-bridge-api-service';

export class RetroBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        slippage: number,
        providerAddress: string,
        quoteSendParams: RetroBridgeQuoteSendParams
    ): Promise<GasData | null> {
        const trade = new RetroBridgeTrade(
            {
                from,
                to,
                feeInfo,
                priceImpact: null,
                slippage,
                gasData: null,
                quoteSendParams
            },
            providerAddress,
            []
        );
        return getCrossChainGasData(trade);
    }

    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE;

    public readonly isAggregator = false;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.RETRO_BRIDGE;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    public readonly slippage: number;

    private readonly quoteSendParams: RetroBridgeQuoteSendParams;

    /*
     * Сookies are used to create a secure session
     */
    private walletCookies = '';

    public retroBridgeId = '';

    private get fromBlockchain(): RetroBridgeSupportedBlockchain {
        return this.from.blockchain as RetroBridgeSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.fromBlockchain].gateway;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    private get chainType(): ChainType {
        return BlockchainsInfo.getChainType(this.fromBlockchain);
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            feeInfo: FeeInfo;
            priceImpact: number | null;
            slippage: number;
            gasData: GasData | null;
            quoteSendParams: RetroBridgeQuoteSendParams;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.quoteSendParams = crossChainTrade.quoteSendParams;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
    }

    protected async getContractParams(
        _options: GetContractParamsOptions,
        _skipAmountChangeCheck?: boolean
    ): Promise<ContractParams> {
        return Promise.reject();
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const _txResponse = await RetroBridgeApiService.createTransaction(
            {
                ...this.quoteSendParams,
                receiver_wallet: receiverAddress || this.walletAddress
            },
            this.chainType,
            this.walletCookies
        );

        return Promise.reject();
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    public async needAuthWallet(): Promise<boolean> {
        try {
            const msg = await RetroBridgeApiService.checkWallet(
                this.walletAddress,
                this.chainType,
                this.walletCookies
            );

            if (msg.toLowerCase() === 'success') {
                return false;
            }

            return true;
        } catch {
            return true;
        }
    }

    public async authWallet(ethereum: ethers.providers.ExternalProvider): Promise<never | void> {
        const provider = new Web3Provider(ethereum);

        const signer = provider.getSigner();

        const signData = await RetroBridgeApiService.getMessageToAuthWallet();

        const signMessage = `${signData}\n${this.walletAddress}`;

        const signature = await signer.signMessage(signMessage);

        const cookies = await RetroBridgeApiService.sendSignedMessage(
            this.walletAddress,
            signature,
            this.chainType
        );

        this.walletCookies = cookies;
    }
}
