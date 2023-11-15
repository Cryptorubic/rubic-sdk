import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<
    BlockchainName,
    {
        gateway: string;
        router: string;
    }
> = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => {
        let gateway = '0x3335733c454805df6a77f825f266e136FB4a3333';
        let router = '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3';
        if (blockchain === BLOCKCHAIN_NAME.POLYGON || blockchain == BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
            gateway = '0x03EbC1d2d0e496CaF0232681069a3c5125894CbC';
            router = '0x9C57699576725ce531C4878DBe0E053B2f4A3619';
        }
        if (blockchain === BLOCKCHAIN_NAME.TELOS) {
            router = '0xA2d8CF32C16f070702c45a5686Fdb0a1d7171AAD';
        }
        if (blockchain === BLOCKCHAIN_NAME.ZK_SYNC) {
            router = '0xa63c029612ddaD00A269383Ab016D1e7c14E851D';
            gateway = '0x8E70e517057e7380587Ea6990dAe81cB1Ba405ce';
        }
        if (
            blockchain === BLOCKCHAIN_NAME.LINEA ||
            blockchain === BLOCKCHAIN_NAME.BASE ||
            blockchain === BLOCKCHAIN_NAME.MANTLE ||
            blockchain === BLOCKCHAIN_NAME.SCROLL
        ) {
            router = '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1';
        }
        if(
            blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET ||
            blockchain === BLOCKCHAIN_NAME.GOERLI||
            blockchain === BLOCKCHAIN_NAME.MUMBAI
        ) {
            router = '0x093510EB0652E07024ec700C3CD1Fb1D79BA7fE9';
        }

        return { ...acc, [blockchain]: { gateway, router } };
    },
    {} as Record<
        BlockchainName,
        {
            gateway: string;
            router: string;
        }
    >
);
