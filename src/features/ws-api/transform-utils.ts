import { BLOCKCHAIN_NAME, QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { NotSupportedTokensError } from 'src/common/errors';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ArbitrumRbcBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/arbitrum-rbc-bridge/arbitrum-rbc-bridge-trade';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';
import { EddyBridgeTrade } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/eddy-bridge-trade';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { EvmApiCrossChainTrade } from 'src/features/ws-api/chains/evm/evm-api-cross-chain-trade';
import { EvmApiOnChainTrade } from 'src/features/ws-api/chains/evm/evm-api-on-chain-trade';
import { SolanaApiCrossChainTrade } from 'src/features/ws-api/chains/solana/solana-api-cross-chain-trade';
import { SolanaApiOnChainTrade } from 'src/features/ws-api/chains/solana/solana-api-on-chain-trade';
import { SuiApiOnChainTrade } from 'src/features/ws-api/chains/sui/sui-api-on-chain-trade';
import { SuiApiOnChainConstructor } from 'src/features/ws-api/chains/sui/sui-api-on-chain-trade-constructor';
import { TonApiCrossChainTrade } from 'src/features/ws-api/chains/ton/ton-api-cross-chain-trade';
import { TonApiOnChainTrade } from 'src/features/ws-api/chains/ton/ton-api-on-chain-trade';
import { TronApiCrossChainTrade } from 'src/features/ws-api/chains/tron/tron-api-cross-chain-trade';
import { TronApiOnChainTrade } from 'src/features/ws-api/chains/tron/tron-api-on-chain-trade';

import {
    TransferTradeSupportedProviders,
    transferTradeSupportedProviders
} from '../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import { BitcoinApiCrossChainConstructor } from './chains/bitcoin/bitcoin-api-cross-chain-constructor';
import { BitcoinApiCrossChainTrade } from './chains/bitcoin/bitcoin-api-cross-chain-trade';
import { EvmApiCrossChainConstructor } from './chains/evm/evm-api-cross-chain-constructor';
import { EvmApiOnChainConstructor } from './chains/evm/evm-api-on-chain-constructor';
import { SolanaApiCrossChainConstructor } from './chains/solana/solana-api-cross-chain-constructor';
import { SolanaApiOnChainConstructor } from './chains/solana/solana-api-on-chain-constructor';
import { TonApiCrossChainConstructor } from './chains/ton/ton-api-cross-chain-constructor';
import { TonApiOnChainConstructor } from './chains/ton/ton-api-on-chain-constructor';
import { ApiCrossChainTransferTrade } from './chains/transfer-trade/api-cross-chain-transfer-trade';
import { TronApiCrossChainConstructor } from './chains/tron/tron-api-cross-chain-constructor';
import { TronApiOnChainConstructor } from './chains/tron/tron-api-on-chain-constructor';
import { RubicApiError } from './models/rubic-api-error';
import { RubicApiParser } from './utils/rubic-api-parser';
import { RubicApiUtils } from './utils/rubic-api-utils';

export class TransformUtils {
    public static async transformCrossChain(
        res: QuoteResponseInterface,
        quote: QuoteRequestInterface,
        _integratorAddress: string,
        err?: RubicApiError
    ): Promise<WrappedCrossChainTrade> {
        if (!res && !err) {
            throw new NotSupportedTokensError();
        }
        const tradeType = (res?.providerType || err?.type) as WrappedCrossChainTrade['tradeType'];
        const tradeParams = await RubicApiUtils.getTradeParams(quote, res, tradeType);

        const parsedError = err ? RubicApiParser.parseRubicApiErrors(err) : err;

        const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);

        let trade: CrossChainTrade | null = null;

        const needProvidePubKey =
            tradeType === CROSS_CHAIN_TRADE_TYPE.TELE_SWAP &&
            tradeParams.from.blockchain === BLOCKCHAIN_NAME.BITCOIN;

        const parsedWarnings = RubicApiParser.parseRubicApiWarnings(res?.warnings || []);

        const isTransferTrade =
            transferTradeSupportedProviders.includes(
                tradeType as TransferTradeSupportedProviders
            ) && chainType !== CHAIN_TYPE.EVM;

        if (isTransferTrade) {
            trade = new ApiCrossChainTransferTrade(tradeParams);
        } else if (chainType === CHAIN_TYPE.EVM) {
            const params = tradeParams as EvmApiCrossChainConstructor;

            if (tradeType === CROSS_CHAIN_TRADE_TYPE.ARBITRUM) {
                trade = new ArbitrumRbcBridgeTrade(params);
            } else if (tradeType === CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE) {
                trade = new EddyBridgeTrade(params);
            } else {
                trade = new EvmApiCrossChainTrade({
                    ...params,
                    needAuthWallet: parsedWarnings.needAuthWallet
                });
            }
        } else if (chainType === CHAIN_TYPE.TON) {
            trade = new TonApiCrossChainTrade(tradeParams as TonApiCrossChainConstructor);
        } else if (chainType === CHAIN_TYPE.TRON) {
            trade = new TronApiCrossChainTrade(tradeParams as TronApiCrossChainConstructor);
        } else if (chainType === CHAIN_TYPE.BITCOIN) {
            trade = new BitcoinApiCrossChainTrade({
                ...tradeParams,
                needProvidePubKey
            } as BitcoinApiCrossChainConstructor);
        } else if (chainType === CHAIN_TYPE.SOLANA) {
            trade = new SolanaApiCrossChainTrade(tradeParams as SolanaApiCrossChainConstructor);
        }

        return {
            trade,
            tradeType,
            ...(parsedError && { error: parsedError })
        };
    }

    public static async transformOnChain(
        response: QuoteResponseInterface,
        quote: QuoteRequestInterface,
        _integratorAddress: string,
        err?: RubicApiError
    ): Promise<WrappedOnChainTradeOrNull> {
        if (!response && !err) {
            throw new NotSupportedTokensError();
        }
        const tradeType = (response?.providerType || err?.type) as OnChainTradeType;
        const tradeParams = await RubicApiUtils.getTradeParams(quote, response, tradeType);

        const parsedError = err ? RubicApiParser.parseRubicApiErrors(err) : err;
        const chainType = BlockchainsInfo.getChainType(quote.srcTokenBlockchain);

        let trade: OnChainTrade | null = null;

        if (chainType === CHAIN_TYPE.EVM) {
            trade = new EvmApiOnChainTrade(tradeParams as EvmApiOnChainConstructor);
        } else if (chainType === CHAIN_TYPE.TRON) {
            trade = new TronApiOnChainTrade(tradeParams as TronApiOnChainConstructor);
        } else if (chainType === CHAIN_TYPE.SOLANA) {
            trade = new SolanaApiOnChainTrade(tradeParams as SolanaApiOnChainConstructor);
        } else if (chainType === CHAIN_TYPE.TON) {
            trade = new TonApiOnChainTrade({
                ...(tradeParams as TonApiOnChainConstructor),
                // @TODO API
                isChangedSlippage: false
            });
        } else if (chainType === CHAIN_TYPE.SUI) {
            trade = new SuiApiOnChainTrade(tradeParams as SuiApiOnChainConstructor);
        }

        return {
            trade,
            tradeType,
            ...(parsedError && { error: parsedError })
        };
    }
}
