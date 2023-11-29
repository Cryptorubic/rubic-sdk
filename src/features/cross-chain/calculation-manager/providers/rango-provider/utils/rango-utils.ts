import { PriceToken } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';

import {
    rangoApiBlockchainNames,
    RangoBlockchainName
} from '../constants/rango-api-blockchain-names';
import { RANGO_SWAP_STATUS, RangoSwapStatus } from '../model/rango-api-status-types';
import { RangoCrossChainSupportedBlockchain } from '../model/rango-cross-chain-supported-blockchains';

export class RangoUtils {
    /**
     * @returns Query-param string in format `chainName.symbol--address`, chainName's compatible with rango-api
     */
    public static getFromToQueryParam(token: PriceToken<EvmBlockchainName>): string {
        const { blockchain, symbol, address, isNative } = token;

        const rangoBlockchainName =
            rangoApiBlockchainNames[blockchain as RangoCrossChainSupportedBlockchain];

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
}
