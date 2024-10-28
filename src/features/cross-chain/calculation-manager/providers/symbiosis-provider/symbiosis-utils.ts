import { PriceToken } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { SymbiosisTradeType } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export class SymbiosisUtils {
    public static getChainId(token: PriceToken): number;
    public static getChainId(blockchain: BlockchainName): number;
    public static getChainId(entity: PriceToken | BlockchainName): number {
        const blockchain = typeof entity === 'object' ? entity.blockchain : entity;
        if (BlockchainsInfo.isTonBlockchainName(blockchain)) {
            return 85918;
        }
        if (BlockchainsInfo.isTronBlockchainName(blockchain)) {
            return 728126428;
        }
        if (BlockchainsInfo.isBitcoinBlockchainName(blockchain)) {
            return 3652501241;
        }
        return blockchainId[blockchain];
    }

    public static getRevertableAddress(
        receiverAddress: string | undefined,
        walletAddress: string,
        toBlockchain: BlockchainName
    ): string {
        if (toBlockchain === BLOCKCHAIN_NAME.BITCOIN || toBlockchain === BLOCKCHAIN_NAME.TON) {
            return walletAddress;
        }

        return receiverAddress || walletAddress;
    }

    public static getSubtype(
        tradeType: {
            in?: SymbiosisTradeType;
            out?: SymbiosisTradeType;
        },
        toBlockchain: BlockchainName
    ): OnChainSubtype {
        const mapping: Record<SymbiosisTradeType | 'default', OnChainTradeType | undefined> = {
            dex: ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP,
            '1inch': ON_CHAIN_TRADE_TYPE.ONE_INCH,
            'open-ocean': ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
            wrap: ON_CHAIN_TRADE_TYPE.WRAPPED,
            izumi: ON_CHAIN_TRADE_TYPE.IZUMI,
            default: undefined
        };
        return {
            from: mapping?.[tradeType?.in || 'default'],
            to:
                toBlockchain === BLOCKCHAIN_NAME.BITCOIN
                    ? ON_CHAIN_TRADE_TYPE.REN_BTC
                    : mapping?.[tradeType?.out || 'default']
        };
    }
}
