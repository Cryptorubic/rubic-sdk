import { PriceToken, Token } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { rangoApiBlockchainNames, RangoBlockchainName } from '../models/rango-api-blockchain-names';
import { RANGO_SWAP_STATUS, RangoSwapStatus } from '../models/rango-api-status-types';
import { rangoApiSymbols } from '../models/rango-api-symbol-names';
import {
    rangoCrossChainTradeTypes,
    rangoOnChainTradeTypes,
    RangoTradeType,
    rangoTradeTypes,
    RubicTradeTypeForRango
} from '../models/rango-api-trade-types';
import { RangoSupportedBlockchain } from '../models/rango-supported-blockchains';

export class RangoUtils {
    /**
     * @returns Query-param string in format `chainName.symbol--address`, chainName's compatible with rango-api
     */
    public static async getFromToQueryParam(token: PriceToken<EvmBlockchainName>): Promise<string> {
        const rangoBlockchainName =
            rangoApiBlockchainNames[token.blockchain as RangoSupportedBlockchain];

        const symbol = token.isNative
            ? rangoApiSymbols[token.blockchain as RangoSupportedBlockchain]
            : (await Token.createToken({ address: token.address, blockchain: token.blockchain }))
                  .symbol;

        const param = token.isNative
            ? `${rangoBlockchainName}.${symbol}`
            : `${rangoBlockchainName}.${symbol}--${token.address}`;

        return param;
    }

    public static convertStatusForRubic(rangoStatus: RangoSwapStatus): TxStatus {
        if (rangoStatus === RANGO_SWAP_STATUS.SUCCESS) {
            return TX_STATUS.SUCCESS;
        }
        if (rangoStatus === RANGO_SWAP_STATUS.RUNNING) {
            return TX_STATUS.PENDING;
        }
        return TX_STATUS.FAIL;
    }

    public static getRubicBlockchainByRangoBlockchain(
        rangoBlockchainName: RangoBlockchainName
    ): BlockchainName {
        const blockchainName = Object.entries(rangoApiBlockchainNames).find(
            ([_, value]) => value === rangoBlockchainName
        )![0] as BlockchainName;

        return blockchainName;
    }

    public static getTradeTypeForRubic(
        swapType: 'cross-chain' | 'on-chain',
        rangoTradeType: RangoTradeType
    ): BridgeType | OnChainTradeType {
        if (swapType === 'cross-chain') {
            const found = Object.entries(rangoCrossChainTradeTypes).find(
                ([_, value]) => value === rangoTradeType
            );

            if (found) {
                return found[0] as BridgeType;
            }
        }

        if (swapType === 'on-chain') {
            const found = Object.entries(rangoOnChainTradeTypes).find(
                ([_, value]) => value === rangoTradeType
            );

            if (found) {
                return found[0] as OnChainTradeType;
            }
        }

        return CROSS_CHAIN_TRADE_TYPE.RANGO;
    }

    public static getTradeTypeForRango(rubicTradeType: RubicTradeTypeForRango): RangoTradeType {
        return rangoTradeTypes[rubicTradeType];
    }
}
