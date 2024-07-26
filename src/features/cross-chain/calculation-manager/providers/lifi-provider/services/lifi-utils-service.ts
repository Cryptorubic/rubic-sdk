import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';

import { LifiCrossChainSupportedBlockchain } from '../constants/lifi-cross-chain-supported-blockchain';

export class LifiUtilsService {
    private static readonly FAKE_SOLANA_RECEIVER_ADDRESS =
        '7cwWhuCJUHc27Dq4nQRhggwgeuVHEeS3NWv7BY6yY9Bk';

    public static getLifiReceiverAddress(
        fromBlockchain: LifiCrossChainSupportedBlockchain,
        toBlockchain: LifiCrossChainSupportedBlockchain,
        fromAddress: string,
        receiverAddress: string | undefined
    ): string {
        if (receiverAddress) {
            return receiverAddress;
        }

        if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            return FAKE_WALLET_ADDRESS;
        } else if (toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            return this.FAKE_SOLANA_RECEIVER_ADDRESS;
        }

        return fromAddress;
    }
}
