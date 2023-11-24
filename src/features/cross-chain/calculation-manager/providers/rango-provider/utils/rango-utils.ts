import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';

import { rangoApiBlockchainNames } from '../constants/rango-api-blockchain-names';
import { RANGO_SWAP_STATUS, RangoSwapStatus } from '../model/rango-api-status-types';
import { RangoCrossChainSupportedBlockchain } from '../model/rango-cross-chain-supported-blockchains';

export class RangoUtils {
    /**
     * @returns Query-param string in format `chainName.symbol--address`, chainName's compatible with rango-api
     */
    public static getFromToQueryParam(
        blockchainName: EvmBlockchainName,
        tokenSymbol: string,
        tokenAddress: string
    ): string {
        const rangoBlockchainName =
            rangoApiBlockchainNames[blockchainName as RangoCrossChainSupportedBlockchain];
        const param = `${rangoBlockchainName}.${tokenSymbol}--${tokenAddress}`;
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
}
