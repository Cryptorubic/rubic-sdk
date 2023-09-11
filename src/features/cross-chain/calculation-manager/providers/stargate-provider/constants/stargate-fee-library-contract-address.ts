import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { StargateCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-cross-chain-supported-blockchain';

export const stargateFeeLibraryContractAddress: Record<
    StargateCrossChainSupportedBlockchain,
    string
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x8C3085D9a554884124C998CDB7f6d7219E9C1e6F',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xCA6522116e8611A346D53Cc2005AC4192e3fc2BC',
    [BLOCKCHAIN_NAME.POLYGON]: '0xb279b324Ea5648bE6402ABc727173A225383494C',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x5E8eC15ACB5Aa94D5f0589E54441b31c5e0B992d',
    [BLOCKCHAIN_NAME.FANTOM]: '0x616a68BD6DAd19e066661C7278611487d4072839#',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x1cF31666c06ac3401ed0C1c6346C4A9425dd7De4',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0x505eCDF2f14Cd4f1f413d04624b009A449D38D7E',
    [BLOCKCHAIN_NAME.METIS]: '0x55bDb4164D28FBaF0898e0eF14a589ac09Ac9970',
    [BLOCKCHAIN_NAME.BASE]: '0x9d1b1669c73b033dfe47ae5a0164ab96df25b944'
};
