import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ChainType } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { retroBridgeContractAddresses } from './constants/retro-bridge-contract-address';
import { RetroBridgeSupportedBlockchain } from './constants/retro-bridge-supported-blockchain';
import { retroBridgeSwapAbi } from './constants/retro-bridge-swap-abi';
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

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );
        try {
            const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
                walletAddress: this.walletAddress,
                fromTokenAmount: this.from,
                toTokenAmount: this.to,
                srcChainTrade: null,
                providerAddress: this.providerAddress,
                type: `native:${this.bridgeType}`,
                fromAddress: this.walletAddress
            });
            const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
                to,
                data,
                this.from.blockchain,
                to,
                '0'
            );

            const methodArguments = [bridgeData, providerData];
            const value = this.getSwapValue(providerValue);

            const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
                rubicProxyContractAddress[this.from.blockchain].router,
                evmCommonCrossChainAbi,
                this.methodName,
                methodArguments,
                value
            );

            const sendingToken = this.from.isNative ? [] : [this.from.address];
            const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

            return {
                contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
                contractAbi: gatewayRubicCrossChainAbi,
                methodName: 'startViaRubic',
                methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
                value
            };
        } catch (err) {
            console.error(err?.message);
            throw new RubicSdkError(err?.message);
        }
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const needAuthWallet = await this.needAuthWallet();
        if (needAuthWallet) {
            throw new RubicSdkError('Need to authorize the wallet via authWallet method');
        }
        const retroBridgeOrder = await RetroBridgeApiService.createTransaction(
            {
                ...this.quoteSendParams,
                receiver_wallet: receiverAddress || this.walletAddress
            },
            this.chainType
        );
        this.retroBridgeId = retroBridgeOrder.transaction_id;
        const transferAmount = this.from.stringWeiAmount;

        let config: EvmEncodeConfig = { to: '', data: '', value: '' };

        if (this.isProxyTrade) {
            config = this.createProxyEvmConfig(transferAmount);
        } else {
            config = this.createEvmConfigWithoutProxy(
                transferAmount,
                retroBridgeOrder.hot_wallet_address
            );
        }

        return { config, amount: this.to.stringWeiAmount };
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
            const msg = await RetroBridgeApiService.checkWallet(this.walletAddress, this.chainType);

            return msg.toLowerCase() !== 'success';
        } catch {
            return true;
        }
    }

    public async authWallet(): Promise<never | void> {
        const signData = await RetroBridgeApiService.getMessageToAuthWallet();

        const signMessage = `${signData}\n${this.walletAddress}`;

        const signature = await this.web3Private.signMessage(signMessage);
        await RetroBridgeApiService.sendSignedMessage(
            this.walletAddress,
            signature,
            this.chainType
        );
    }

    private createProxyEvmConfig(transferAmount: string): EvmEncodeConfig {
        const value = this.from.isNative ? transferAmount : '0';

        const methodArguments = this.from.isNative
            ? [this.walletAddress]
            : [this.walletAddress, this.from.address, transferAmount];

        const methodName = this.from.isNative ? 'transferEther' : 'transferToken';

        const config = EvmWeb3Pure.encodeMethodCall(
            retroBridgeContractAddresses[this.fromBlockchain],
            retroBridgeSwapAbi,
            methodName,
            methodArguments,
            value
        );

        return config;
    }

    private createEvmConfigWithoutProxy(
        transferAmount: string,
        hotWalletAddress: string
    ): EvmEncodeConfig {
        const config: EvmEncodeConfig = { to: '', data: '', value: '' };

        if (this.from.isNative) {
            config.value = transferAmount;
            config.data = '0x';
            config.to = hotWalletAddress;
        } else {
            const encodedConfig = EvmWeb3Pure.encodeMethodCall(
                this.from.address,
                ERC20_TOKEN_ABI,
                'transfer',
                [hotWalletAddress, transferAmount],
                '0'
            );
            config.value = encodedConfig.value;
            config.to = encodedConfig.to;
            config.data = encodedConfig.data;
        }

        return config;
    }
}
