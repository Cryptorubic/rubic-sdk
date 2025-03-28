import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { SymbiosisCcrBitcoinTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-bitcoin-trade';
import { SymbiosisEvmCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-evm-trade';
import { SymbiosisCcrTonTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-ton-trade';
import { SymbiosisTronCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-tron-trade';
import {
    SymbiosisbitcoinCrossChainTradeConstructor,
    SymbiosisCrossChainTradeConstructor,
    SymbiosisEvmCrossChainTradeConstructor,
    SymbiosisTonCrossChainTradeConstructor,
    SymbiosisTronCrossChainTradeConstructor
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-cross-chain-trade-constructor';

import { RubicStep } from '../common/models/rubicStep';

export class SymbiosisCrossChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: SymbiosisCrossChainTradeConstructor<BlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ):
        | SymbiosisCcrTonTrade
        | SymbiosisEvmCcrTrade
        | SymbiosisTronCcrTrade
        | SymbiosisCcrBitcoinTrade {
        if (BlockchainsInfo.isTonBlockchainName(fromBlockchain)) {
            return new SymbiosisCcrTonTrade(
                constructorParams as SymbiosisTonCrossChainTradeConstructor,
                providerAddress,
                routePath,
                apiQuote,
                apiResponse
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new SymbiosisEvmCcrTrade(
                constructorParams as SymbiosisEvmCrossChainTradeConstructor,
                providerAddress,
                routePath,
                apiQuote,
                apiResponse
            );
        }

        if (BlockchainsInfo.isTronBlockchainName(fromBlockchain)) {
            return new SymbiosisTronCcrTrade(
                constructorParams as SymbiosisTronCrossChainTradeConstructor,
                providerAddress,
                routePath,
                apiQuote,
                apiResponse
            );
        }
        if (BlockchainsInfo.isBitcoinBlockchainName(fromBlockchain)) {
            return new SymbiosisCcrBitcoinTrade(
                constructorParams as SymbiosisbitcoinCrossChainTradeConstructor,
                providerAddress,
                routePath,
                apiQuote,
                apiResponse
            );
        }
        throw new Error('Can not create trade instance');
    }
}
