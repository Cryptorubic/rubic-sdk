import { PriceToken, Token } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';

import { rangoApiBlockchainNames, RangoBlockchainName } from '../models/rango-api-blockchain-names';
import { RANGO_SWAP_STATUS, RangoSwapStatus } from '../models/rango-api-status-types';
import { rangoApiSymbols } from '../models/rango-api-symbol-names';
import { RANGO_TO_RUBIC_PROVIDERS, RangoTradeType } from '../models/rango-api-trade-types';
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

        if (token.isNative && token.blockchain === BLOCKCHAIN_NAME.METIS) {
            return `${rangoBlockchainName}.${symbol}--0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000`;
        }

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
        rangoTradeType: RangoTradeType,
        type: 'cross-chain' | 'on-chain'
    ): BridgeType | OnChainTradeType {
        if (type === 'cross-chain') {
            return RANGO_TO_RUBIC_PROVIDERS[rangoTradeType] || CROSS_CHAIN_TRADE_TYPE.RANGO;
        }
        return RANGO_TO_RUBIC_PROVIDERS[rangoTradeType] || ON_CHAIN_TRADE_TYPE.RANGO;
    }
}
