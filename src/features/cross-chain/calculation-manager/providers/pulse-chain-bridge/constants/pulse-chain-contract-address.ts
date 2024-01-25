import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PulseChainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';

export const pulseChainContractAddress: Record<
    PulseChainCrossChainSupportedBlockchain,
    {
        omniBridge: string;
        omniBridgeWrapped: string;
    }
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        omniBridge: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
        omniBridgeWrapped: '0xe20E337DB2a00b1C37139c873B92a0AAd3F468bF'
    },
    [BLOCKCHAIN_NAME.PULSECHAIN]: {
        omniBridge: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
        omniBridgeWrapped: '0x0e18d0d556b652794EF12Bf68B2dC857EF5f3996'
    }
};

export const omniBridgeNativeRouter = '0x8AC4ae65b3656e26dC4e0e69108B392283350f55';
