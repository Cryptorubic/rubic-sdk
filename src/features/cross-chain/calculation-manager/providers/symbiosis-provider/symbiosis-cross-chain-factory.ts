import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { SymbiosisEvmCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-evm-trade';
import { SymbiosisCcrTonTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-ton-trade';
import { SymbiosisTronCcrTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/chain-trades/symbiosis-ccr-tron-trade';
import {
    SymbiosisCrossChainTradeConstructor,
    SymbiosisEvmCrossChainTradeConstructor,
    SymbiosisTonCrossChainTradeConstructor,
    SymbiosisTronCrossChainTradeConstructor
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-cross-chain-trade-constructor';
import { SymbiosisSwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-swapping-params';

import { RubicStep } from '../common/models/rubicStep';

export class SymbiosisCrossChainFactory {
    public static createTrade(
        fromBlockchain: BlockchainName,
        constructorParams: SymbiosisCrossChainTradeConstructor<BlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ): SymbiosisCcrTonTrade | SymbiosisEvmCcrTrade | SymbiosisTronCcrTrade {
        if (BlockchainsInfo.isTonBlockchainName(fromBlockchain)) {
            return new SymbiosisCcrTonTrade(
                constructorParams as SymbiosisTonCrossChainTradeConstructor,
                providerAddress,
                routePath,
                useProxy
            );
        }

        if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
            return new SymbiosisEvmCcrTrade(
                constructorParams as SymbiosisEvmCrossChainTradeConstructor,
                providerAddress,
                routePath,
                useProxy
            );
        }

        if (BlockchainsInfo.isTronBlockchainName(fromBlockchain)) {
            return new SymbiosisTronCcrTrade(
                constructorParams as SymbiosisTronCrossChainTradeConstructor,
                providerAddress,
                routePath,
                useProxy
            );
        }
        throw new Error('Can not create trade instance');
    }

    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount,
        swapParams: SymbiosisSwappingParams,
        feeInfo: FeeInfo,
        providerGateway: string,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const type = BlockchainsInfo.getChainType(from.blockchain);
        if (type === CHAIN_TYPE.TON || CHAIN_TYPE.TRON) {
            return null;
        }
        if (type === CHAIN_TYPE.EVM) {
            return SymbiosisEvmCcrTrade.getGasData(
                from,
                toToken,
                swapParams,
                feeInfo,
                providerGateway,
                providerAddress,
                receiverAddress
            );
        }
        throw new Error('From blockchain not supported');
    }
}
