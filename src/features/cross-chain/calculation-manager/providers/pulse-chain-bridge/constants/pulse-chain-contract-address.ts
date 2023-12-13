import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PulseChainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';

export const pulseChainContractAddress: Record<PulseChainCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
    [BLOCKCHAIN_NAME.PULSECHAIN]: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef'
};
