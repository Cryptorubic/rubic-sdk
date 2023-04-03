import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';

export const chainTypeByBlockchain: Record<BlockchainName, CHAIN_TYPE> = {
    ...Object.values(EVM_BLOCKCHAIN_NAME).reduce(
        (acc, evmBlockchainName) => ({
            ...acc,
            [evmBlockchainName]: CHAIN_TYPE.EVM
        }),
        {} as Record<EvmBlockchainName, CHAIN_TYPE.EVM>
    ),
    [BLOCKCHAIN_NAME.BITCOIN]: CHAIN_TYPE.BITCOIN,
    [BLOCKCHAIN_NAME.TRON]: CHAIN_TYPE.TRON,
    [BLOCKCHAIN_NAME.ICP]: CHAIN_TYPE.ICP,

    [BLOCKCHAIN_NAME.SOLANA]: CHAIN_TYPE.SOLANA,
    [BLOCKCHAIN_NAME.NEAR]: CHAIN_TYPE.NEAR,
    [BLOCKCHAIN_NAME.CARDANO]: CHAIN_TYPE.CARDANO,
    [BLOCKCHAIN_NAME.AION]: CHAIN_TYPE.AION,
    [BLOCKCHAIN_NAME.ALGORAND]: CHAIN_TYPE.ALGORAND,
    [BLOCKCHAIN_NAME.APTOS]: CHAIN_TYPE.APTOS,
    [BLOCKCHAIN_NAME.ARDOR]: CHAIN_TYPE.ARDOR,
    [BLOCKCHAIN_NAME.ARK]: CHAIN_TYPE.ARK,
    [BLOCKCHAIN_NAME.COSMOS]: CHAIN_TYPE.COSMOS,
    [BLOCKCHAIN_NAME.BAND_PROTOCOL]: CHAIN_TYPE.BAND_PROTOCOL,
    [BLOCKCHAIN_NAME.BITCOIN_DIAMOND]: CHAIN_TYPE.BITCOIN_DIAMOND,
    [BLOCKCHAIN_NAME.BSV]: CHAIN_TYPE.BSV,
    [BLOCKCHAIN_NAME.BITCOIN_GOLD]: CHAIN_TYPE.BITCOIN_GOLD,
    [BLOCKCHAIN_NAME.CASPER]: CHAIN_TYPE.CASPER,
    [BLOCKCHAIN_NAME.DASH]: CHAIN_TYPE.DASH,
    [BLOCKCHAIN_NAME.DECRED]: CHAIN_TYPE.DECRED,
    [BLOCKCHAIN_NAME.DIGI_BYTE]: CHAIN_TYPE.DIGI_BYTE,
    [BLOCKCHAIN_NAME.DIVI]: CHAIN_TYPE.DIVI,
    [BLOCKCHAIN_NAME.DOGECOIN]: CHAIN_TYPE.DOGECOIN,
    [BLOCKCHAIN_NAME.POLKADOT]: CHAIN_TYPE.POLKADOT,
    [BLOCKCHAIN_NAME.MULTIVERS_X]: CHAIN_TYPE.MULTIVERS_X,
    [BLOCKCHAIN_NAME.FIO_PROTOCOL]: CHAIN_TYPE.FIO_PROTOCOL,
    [BLOCKCHAIN_NAME.FIRO]: CHAIN_TYPE.FIRO,
    [BLOCKCHAIN_NAME.FLOW]: CHAIN_TYPE.FLOW,
    [BLOCKCHAIN_NAME.HEDERA]: CHAIN_TYPE.HEDERA,
    [BLOCKCHAIN_NAME.HELIUM]: CHAIN_TYPE.HELIUM,
    [BLOCKCHAIN_NAME.ICON]: CHAIN_TYPE.ICON,
    [BLOCKCHAIN_NAME.IOST]: CHAIN_TYPE.IOST,
    [BLOCKCHAIN_NAME.IOTA]: CHAIN_TYPE.IOTA,
    [BLOCKCHAIN_NAME.KADENA]: CHAIN_TYPE.KADENA,
    [BLOCKCHAIN_NAME.KOMODO]: CHAIN_TYPE.KOMODO,
    [BLOCKCHAIN_NAME.KUSAMA]: CHAIN_TYPE.KUSAMA,
    [BLOCKCHAIN_NAME.LISK]: CHAIN_TYPE.LISK,
    [BLOCKCHAIN_NAME.LITECOIN]: CHAIN_TYPE.LITECOIN,
    [BLOCKCHAIN_NAME.TERRA]: CHAIN_TYPE.TERRA,
    [BLOCKCHAIN_NAME.TERRA_CLASSIC]: CHAIN_TYPE.TERRA_CLASSIC,
    [BLOCKCHAIN_NAME.MINA_PROTOCOL]: CHAIN_TYPE.MINA_PROTOCOL,
    [BLOCKCHAIN_NAME.NANO]: CHAIN_TYPE.NANO,
    [BLOCKCHAIN_NAME.NEO]: CHAIN_TYPE.NEO,
    [BLOCKCHAIN_NAME.OSMOSIS]: CHAIN_TYPE.OSMOSIS,
    [BLOCKCHAIN_NAME.PIVX]: CHAIN_TYPE.PIVX,
    [BLOCKCHAIN_NAME.POLYX]: CHAIN_TYPE.POLYX,
    [BLOCKCHAIN_NAME.QTUM]: CHAIN_TYPE.QTUM,
    [BLOCKCHAIN_NAME.THOR_CHAIN]: CHAIN_TYPE.THOR_CHAIN,
    [BLOCKCHAIN_NAME.RAVENCOIN]: CHAIN_TYPE.RAVENCOIN,
    [BLOCKCHAIN_NAME.SIA]: CHAIN_TYPE.SIA,
    [BLOCKCHAIN_NAME.SECRET]: CHAIN_TYPE.SECRET,
    [BLOCKCHAIN_NAME.STEEM]: CHAIN_TYPE.STEEM,
    [BLOCKCHAIN_NAME.STRATIS]: CHAIN_TYPE.STRATIS,
    [BLOCKCHAIN_NAME.STACKS]: CHAIN_TYPE.STACKS,
    [BLOCKCHAIN_NAME.SOLAR]: CHAIN_TYPE.SOLAR,
    [BLOCKCHAIN_NAME.TON]: CHAIN_TYPE.TON,
    [BLOCKCHAIN_NAME.VE_CHAIN]: CHAIN_TYPE.VE_CHAIN,
    [BLOCKCHAIN_NAME.WAVES]: CHAIN_TYPE.WAVES,
    [BLOCKCHAIN_NAME.WAX]: CHAIN_TYPE.WAX,
    [BLOCKCHAIN_NAME.DX_CHAIN]: CHAIN_TYPE.DX_CHAIN,
    [BLOCKCHAIN_NAME.E_CASH]: CHAIN_TYPE.E_CASH,
    [BLOCKCHAIN_NAME.NEM]: CHAIN_TYPE.NEM,
    [BLOCKCHAIN_NAME.STELLAR]: CHAIN_TYPE.STELLAR,
    [BLOCKCHAIN_NAME.MONERO]: CHAIN_TYPE.MONERO,
    [BLOCKCHAIN_NAME.RIPPLE]: CHAIN_TYPE.RIPPLE,
    [BLOCKCHAIN_NAME.TEZOS]: CHAIN_TYPE.TEZOS,
    [BLOCKCHAIN_NAME.VERGE]: CHAIN_TYPE.VERGE,
    [BLOCKCHAIN_NAME.SYMBOL]: CHAIN_TYPE.SYMBOL,
    [BLOCKCHAIN_NAME.ZCASH]: CHAIN_TYPE.ZCASH,
    [BLOCKCHAIN_NAME.HORIZEN]: CHAIN_TYPE.HORIZEN,
    [BLOCKCHAIN_NAME.ZILLIQA]: CHAIN_TYPE.ZILLIQA,
    [BLOCKCHAIN_NAME.FILECOIN]: CHAIN_TYPE.FILECOIN,
    [BLOCKCHAIN_NAME.ZK_SYNC]: CHAIN_TYPE.EVM
};
