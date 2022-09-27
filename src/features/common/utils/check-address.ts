import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

export function isAddressCorrect(address: string, toBlockchain: BlockchainName): boolean {
    const toChainType = BlockchainsInfo.getChainType(toBlockchain);
    return Web3Pure[toChainType].isAddressCorrect(address);
}
