import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const zetaswapOnChainSupportedBlockchains = [BLOCKCHAIN_NAME.ZETACHAIN] as const;

export type ZetaswapOnChainSupportedBlockchains =
    (typeof zetaswapOnChainSupportedBlockchains)[number];
