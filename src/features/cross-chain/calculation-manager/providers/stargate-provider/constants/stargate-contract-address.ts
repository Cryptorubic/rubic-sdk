import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { StargateCrossChainSupportedBlockchain } from './stargate-cross-chain-supported-blockchain';

export const stargateContractAddress: Record<StargateCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
    [BLOCKCHAIN_NAME.POLYGON]: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    [BLOCKCHAIN_NAME.FANTOM]: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b'
};

export const stargateEthContractAddress: Partial<
    Record<StargateCrossChainSupportedBlockchain, string>
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x150f94B44927F078737562f0fcF3C95c01Cc2376',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0xB49c4e680174E331CB0A7fF3Ab58afC9738d5F8b',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0xbf22f0f184bCcbeA268dF387a49fF5238dD23E40'
};
