import { Address } from '@ton/core';
import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    NotSupportedTokensError,
    RubicSdkError
} from 'src/common/errors';
import { MaxDecimalsError } from 'src/common/errors/swap/max-decimals.error';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { parseError } from 'src/common/utils/errors';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RetroBridgeFactory } from 'src/features/cross-chain/calculation-manager/providers/retro-bridge/retro-bridge-factory';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { retroBridgeBlockchainTickers } from './constants/retro-bridge-blockchain-ticker';
import {
    RetroBridgeSupportedBlockchain,
    retroBridgeSupportedBlockchain
} from './constants/retro-bridge-supported-blockchain';
import { RetroBridgeQuoteSendParams } from './models/retro-bridge-quote-send-params';
import { RetroBridgeApiService } from './services/retro-bridge-api-service';

export class RetroBridgeProvider extends CrossChainProvider {
    private readonly MAX_DECIMAL = 6;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.RETRO_BRIDGE;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return retroBridgeSupportedBlockchain.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as RetroBridgeSupportedBlockchain;
        let useProxy = options?.useProxy?.[this.type] ?? true;
        if (BlockchainsInfo.getChainType(fromBlockchain) !== CHAIN_TYPE.EVM) {
            useProxy = false;
        }

        try {
            const { fromTokenTicker, toTokenTicker } = await this.getFromToTokenTickers(
                from,
                toToken
            );

            this.checkFromAmountDecimals(from);
            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );
            const srcChain = this.getBlockchainTicker(
                from.blockchain as RetroBridgeSupportedBlockchain
            );

            const dstChain = this.getBlockchainTicker(
                toToken.blockchain as RetroBridgeSupportedBlockchain
            );

            const quoteSendParams: RetroBridgeQuoteSendParams = {
                source_chain: srcChain,
                destination_chain: dstChain,
                asset_from: fromTokenTicker,
                asset_to: toTokenTicker,
                amount: Web3Pure.fromWei(
                    fromWithoutFee.stringWeiAmount,
                    fromWithoutFee.decimals
                ).toFixed()
            };

            try {
                await this.checkMinMaxAmount(from, toToken, fromTokenTicker, toTokenTicker);
            } catch (err) {
                if (err instanceof MinAmountError || err instanceof MaxAmountError) {
                    return this.getEmptyTrade(
                        from,
                        toToken,
                        feeInfo,
                        quoteSendParams,
                        options.providerAddress,
                        err
                    );
                }
                throw err;
            }

            const retroBridgeQuoteConfig = await RetroBridgeApiService.getQuote(quoteSendParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: new BigNumber(retroBridgeQuoteConfig.amount_out)
            });

            const routePath = await this.getRoutePath(from, to);
            const nativeToken = await PriceToken.createFromToken(nativeTokensList[from.blockchain]);

            const totalGas = Web3Pure.toWei(
                new BigNumber(retroBridgeQuoteConfig.blockchain_fee_in_usd).div(nativeToken.price),
                nativeToken.decimals
            );

            const gasData = await this.getGasData(from, { totalGas });

            const trade = RetroBridgeFactory.createTrade(
                fromBlockchain,
                {
                    from,
                    to,
                    feeInfo,
                    priceImpact: from.calculatePriceImpactPercent(to),
                    slippage: options.slippageTolerance,
                    gasData,
                    quoteSendParams,
                    hotWalletAddress: retroBridgeQuoteConfig.hot_wallet_address
                },
                options.providerAddress,
                routePath,
                useProxy
            );

            const isDecimalsGtThanMax = this.checkFromAmountDecimals(from);

            if (isDecimalsGtThanMax) {
                return {
                    trade,
                    tradeType: this.type,
                    error: new MaxDecimalsError(this.MAX_DECIMAL)
                };
            }

            return {
                trade,
                tradeType: this.type
            };
        } catch (err) {
            return {
                trade: null,
                error: parseError(err),
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [from, toToken] }];
    }

    protected async getFeeInfo(
        fromBlockchain: RetroBridgeSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }

    private async checkMinMaxAmount(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        fromTokenTicker: string,
        toTokenTicker: string
    ): Promise<void | never> {
        const srcChain = this.getBlockchainTicker(
            from.blockchain as RetroBridgeSupportedBlockchain
        );

        const dstChain = this.getBlockchainTicker(
            toToken.blockchain as RetroBridgeSupportedBlockchain
        );

        const tokenLimits = await RetroBridgeApiService.getTokenLimits(
            srcChain,
            dstChain,
            fromTokenTicker,
            toTokenTicker
        );
        const minSendAmount = new BigNumber(Web3Pure.toWei(tokenLimits.min_send, from.decimals));
        const maxSendAmount = new BigNumber(Web3Pure.toWei(tokenLimits.max_send, from.decimals));

        if (from.weiAmount.lt(minSendAmount)) {
            throw new MinAmountError(new BigNumber(tokenLimits.min_send), from.symbol);
        }
        if (from.weiAmount.gt(maxSendAmount)) {
            throw new MaxAmountError(new BigNumber(tokenLimits.max_send), from.symbol);
        }
    }

    private checkFromAmountDecimals(from: PriceTokenAmount): boolean {
        if (from.decimals > this.MAX_DECIMAL) {
            const stringAmount = from.tokenAmount.toFixed();

            const amountDecimals = stringAmount.split('.')[1]?.length ?? 0;

            if (amountDecimals > this.MAX_DECIMAL) {
                return true;
            }
        }

        return false;
    }

    private getBlockchainTicker(blockchain: BlockchainName): string {
        const blockchainTicker =
            retroBridgeBlockchainTickers[blockchain as RetroBridgeSupportedBlockchain];

        if (!blockchainTicker) {
            return blockchain;
        }
        return blockchainTicker;
    }

    private getEmptyTrade(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        feeInfo: FeeInfo,
        quoteSendParams: RetroBridgeQuoteSendParams,
        providerAddress: string,
        error?: RubicSdkError
    ): CalculationResult {
        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: new BigNumber(0)
        });

        const trade = RetroBridgeFactory.createTrade(
            from.blockchain,
            {
                from,
                feeInfo,
                to,
                priceImpact: null,
                slippage: 0,
                gasData: null,
                quoteSendParams,
                hotWalletAddress: ''
            },
            providerAddress,
            [],
            false
        );

        return {
            tradeType: this.type,
            trade,
            error
        };
    }

    private async getFromToTokenTickers(
        fromToken: PriceTokenAmount,
        toToken: PriceToken
    ): Promise<{ fromTokenTicker: string; toTokenTicker: string }> {
        const fromChainTicker = this.getBlockchainTicker(fromToken.blockchain);
        const toChainTicker = this.getBlockchainTicker(toToken.blockchain);

        const { data: tokenList } = await RetroBridgeApiService.getTokenList(
            fromChainTicker,
            toChainTicker
        );

        const fromTokenAddress = this.parseTokenAddress(fromToken.address, fromToken.blockchain);
        const toTokenAddress = this.parseTokenAddress(toToken.address, toToken.blockchain);

        const from = tokenList.find(
            token =>
                (compareAddresses(token.contract_address, fromTokenAddress) && !token.native) ||
                (fromToken.isNative && token.native)
        );

        if (!from) {
            throw new NotSupportedTokensError();
        }

        const to = from.pairs.find(
            tokenTo =>
                (compareAddresses(tokenTo.contract_address, toTokenAddress) && !tokenTo.native) ||
                (toToken.isNative && tokenTo.native)
        );

        if (!to) {
            throw new NotSupportedTokensError();
        }

        return { fromTokenTicker: from.name, toTokenTicker: to.name };
    }

    private parseTokenAddress(tokenAddress: string, blockchain: BlockchainName): string {
        const chainType = BlockchainsInfo.getChainType(blockchain);
        if (Web3Pure[chainType].isNativeAddress(tokenAddress)) return tokenAddress;

        if (blockchain === BLOCKCHAIN_NAME.TON) {
            return Address.parseRaw(tokenAddress).toString();
        }

        return tokenAddress;
    }
}
