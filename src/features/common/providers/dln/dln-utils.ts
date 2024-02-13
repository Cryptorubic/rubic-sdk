import { Token } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';

export class DlnUtils {
    public static getSupportedAddress(token: Token): string {
        if (token.blockchain === BLOCKCHAIN_NAME.SOLANA && token.isNative) {
            return '11111111111111111111111111111111';
        }
        return token.address;
    }

    public static getFakeReceiver(blockchain: BlockchainName): string {
        const type = BlockchainsInfo.getChainType(blockchain);
        if (type === CHAIN_TYPE.EVM) {
            return '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
        }
        if (type === CHAIN_TYPE.SOLANA) {
            return 'HZgssrdZjBdypDux7tHWWDZ7hF7hhwUXN445t85GaoQT';
        }
        throw new Error('Chain type is not supported');
    }
}
