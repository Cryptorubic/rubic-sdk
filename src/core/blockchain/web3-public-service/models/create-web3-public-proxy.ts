import { EvmBlockchainName, TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Web3PublicSupportedBlockchainName } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Any } from 'src/common/utils/types';

export type CreateWeb3Public = Record<
    Web3PublicSupportedBlockchainName,
    (blockchainName?: Any) => Web3Public
> &
    Record<EvmBlockchainName, (blockchainName: EvmBlockchainName) => EvmWeb3Public> &
    Record<TronBlockchainName, () => TronWeb3Public>;
