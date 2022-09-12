import { Blockchain } from 'src/core/blockchain/models/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const blockchains: ReadonlyArray<Blockchain> = [
    {
        id: 1,
        name: BLOCKCHAIN_NAME.ETHEREUM
    },
    {
        id: 56,
        name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    },
    {
        id: 137,
        name: BLOCKCHAIN_NAME.POLYGON
    },
    {
        id: 43114,
        name: BLOCKCHAIN_NAME.AVALANCHE
    },
    {
        id: 1285,
        name: BLOCKCHAIN_NAME.MOONRIVER
    },
    {
        id: 250,
        name: BLOCKCHAIN_NAME.FANTOM
    },
    {
        id: 1666600000,
        name: BLOCKCHAIN_NAME.HARMONY
    },
    {
        id: 42161,
        name: BLOCKCHAIN_NAME.ARBITRUM
    },
    {
        id: 1313161554,
        name: BLOCKCHAIN_NAME.AURORA
    },
    {
        id: 40,
        name: BLOCKCHAIN_NAME.TELOS
    },
    {
        id: 10,
        name: BLOCKCHAIN_NAME.OPTIMISM
    },
    {
        id: 25,
        name: BLOCKCHAIN_NAME.CRONOS
    },
    {
        id: 66,
        name: BLOCKCHAIN_NAME.OKE_X_CHAIN
    },
    {
        id: 100,
        name: BLOCKCHAIN_NAME.GNOSIS
    },
    {
        id: 122,
        name: BLOCKCHAIN_NAME.FUSE
    },
    {
        id: 1284,
        name: BLOCKCHAIN_NAME.MOONBEAM
    },
    {
        id: 42220,
        name: BLOCKCHAIN_NAME.CELO
    },
    {
        id: 288,
        name: BLOCKCHAIN_NAME.BOBA
    },
    {
        id: 5555,
        name: BLOCKCHAIN_NAME.BITCOIN
    }
];
