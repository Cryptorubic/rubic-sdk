import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';

export const chainTypeByBlockchain: Partial<Record<BlockchainName, CHAIN_TYPE>> = {
    ...Object.values(EVM_BLOCKCHAIN_NAME).reduce(
        (acc, evmBlockchainName) => ({
            ...acc,
            [evmBlockchainName]: CHAIN_TYPE.EVM
        }),
        {} as Record<EvmBlockchainName, CHAIN_TYPE.EVM>
    ),
    [BLOCKCHAIN_NAME.BITCOIN]: CHAIN_TYPE.BITCOIN,
    [BLOCKCHAIN_NAME.TRON]: CHAIN_TYPE.TRON,
    [BLOCKCHAIN_NAME.ICP]: CHAIN_TYPE.ICP
};
