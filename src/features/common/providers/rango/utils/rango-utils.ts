import { PriceToken } from 'src/common/tokens';
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
import {
    rangoCrossChainTradeTypes,
    rangoOnChainTradeTypes,
    RangoTradeType
} from '../models/rango-api-trade-types';
import { RangoSupportedBlockchain } from '../models/rango-supported-blockchains';

export class RangoUtils {
    /**
     * @returns Query-param string in format `chainName.symbol--address`, chainName's compatible with rango-api
     */
    public static getFromToQueryParam(token: PriceToken<EvmBlockchainName>): string {
        const { blockchain, symbol, address, isNative } = token;

        const rangoBlockchainName = rangoApiBlockchainNames[blockchain as RangoSupportedBlockchain];

        const param = isNative
            ? `${rangoBlockchainName}.${symbol}`
            : `${rangoBlockchainName}.${symbol}--${address}`;

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

    public static getTradeType(
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
}
