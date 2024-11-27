import { Any } from 'src/common/utils/types';
import {
    BitcoinBlockchainName,
    EvmBlockchainName,
    SolanaBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { BitcoinWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/bitcoin-web3-public/bitcoin-web3-public';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { SolanaWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/solana-web3-public/solana-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';

export type CreateWeb3Public = Record<
    Web3PublicSupportedBlockchain,
    (blockchainName?: Any) => Web3Public
> &
    Record<EvmBlockchainName, (blockchainName: EvmBlockchainName) => EvmWeb3Public> &
    Record<TronBlockchainName, () => TronWeb3Public> &
    Record<SolanaBlockchainName, () => SolanaWeb3Public> &
    Record<BitcoinBlockchainName, () => BitcoinWeb3Public>;
