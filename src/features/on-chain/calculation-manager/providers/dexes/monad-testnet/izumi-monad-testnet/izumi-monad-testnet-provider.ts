import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { IzumiProvider } from '../../common/izumi-abstract/izumi-provider';

export class IzumiMonadTestnetProvider extends IzumiProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.MONAD_TESTNET;

    protected readonly dexAddress = '0xF6FFe4f3FdC8BBb7F70FFD48e61f17D1e343dDfD';

    protected readonly config = {
        maxTransitTokens: 2,
        quoterAddress: '0x95c5F14106ab4d1dc0cFC9326225287c18c2d247',
        liquidityManagerAddress: '0x1eE5eDC5Fe498a2dD82862746D674DB2a5e7fef6',
        routingTokenAddresses: [
            wrappedNativeTokensList[BLOCKCHAIN_NAME.MONAD_TESTNET]!.address, // WMON
            '0x6a7436775c0d0B70cfF4c5365404ec37c9d9aF4b' // USDT
        ],
        multicallAddress: '0x876508837C162aCedcc5dd7721015E83cbb4e339',
        supportedFees: [2000]
    };
}
