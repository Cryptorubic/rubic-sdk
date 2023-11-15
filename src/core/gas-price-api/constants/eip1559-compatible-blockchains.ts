import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const EIP1559CompatibleBlockchains: Record<BlockchainName, boolean> = {
    ...Object.values(BLOCKCHAIN_NAME).reduce(
        (acc, blockchain) => ({ ...acc, [blockchain]: false }),
        {} as Record<BlockchainName, boolean>
    ),
    [BLOCKCHAIN_NAME.ETHEREUM]: true,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: true,
    [BLOCKCHAIN_NAME.POLYGON]: true,
    [BLOCKCHAIN_NAME.AVALANCHE]: true,
    [BLOCKCHAIN_NAME.FANTOM]: true,
    [BLOCKCHAIN_NAME.ARBITRUM]: true,
    [BLOCKCHAIN_NAME.ZK_SYNC]: true,
    //   [BLOCKCHAIN_NAME.OPTIMISM]: true, - Will be compatible on 3rd of June

    [BLOCKCHAIN_NAME.MUMBAI]: true,
    [BLOCKCHAIN_NAME.GOERLI]: true,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: true
};
