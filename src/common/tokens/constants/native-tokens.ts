import { Token } from 'src/common/tokens/token';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TestnetEvmBlockchain
} from 'src/core/blockchain/models/blockchain-name';
import { BitcoinWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/bitcoin-web3-pure';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { IcpWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/icp-web3-pure';
import { KavaCosmosWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/kava-cosmos-web3-pure';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';

const testnetNativeTokens: Record<TestnetEvmBlockchain, Token> = {
    [BLOCKCHAIN_NAME.FUJI]: new Token({
        blockchain: BLOCKCHAIN_NAME.FUJI,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MUMBAI]: new Token({
        blockchain: BLOCKCHAIN_NAME.MUMBAI,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.GOERLI]: new Token({
        blockchain: BLOCKCHAIN_NAME.GOERLI,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: new Token({
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Test Binance Coin',
        symbol: 'tBNB',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: new Token({
        blockchain: BLOCKCHAIN_NAME.SCROLL_SEPOLIA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ARTHERA]: new Token({
        blockchain: BLOCKCHAIN_NAME.ARTHERA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Arthera',
        symbol: 'AA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ZETACHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Zeta',
        symbol: 'ZETA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.TAIKO]: new Token({
        blockchain: BLOCKCHAIN_NAME.TAIKO,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SEPOLIA]: new Token({
        blockchain: BLOCKCHAIN_NAME.SEPOLIA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    })
};

export const nativeTokensList: Record<BlockchainName, Token> = {
    ...Object.values(BLOCKCHAIN_NAME).reduce(
        (acc, blockchain) => ({ ...acc, [blockchain]: blockchain }),
        {} as Record<BlockchainName, Token>
    ),
    ...testnetNativeTokens,
    [BLOCKCHAIN_NAME.ETHEREUM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.POLYGON]: new Token({
        blockchain: BLOCKCHAIN_NAME.POLYGON,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: new Token({
        blockchain: BLOCKCHAIN_NAME.POLYGON_ZKEVM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.AVALANCHE]: new Token({
        blockchain: BLOCKCHAIN_NAME.AVALANCHE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MOONRIVER]: new Token({
        blockchain: BLOCKCHAIN_NAME.MOONRIVER,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FANTOM]: new Token({
        blockchain: BLOCKCHAIN_NAME.FANTOM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.HARMONY]: new Token({
        blockchain: BLOCKCHAIN_NAME.HARMONY,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ARBITRUM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ARBITRUM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'AETH',
        symbol: 'AETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.AURORA]: new Token({
        blockchain: BLOCKCHAIN_NAME.AURORA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'aETH',
        symbol: 'aETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.TELOS]: new Token({
        blockchain: BLOCKCHAIN_NAME.TELOS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'TLOS',
        symbol: 'TLOS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.OPTIMISM]: new Token({
        blockchain: BLOCKCHAIN_NAME.OPTIMISM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.CRONOS]: new Token({
        blockchain: BLOCKCHAIN_NAME.CRONOS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'CRO',
        symbol: 'CRO',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'OKT',
        symbol: 'OKT',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.GNOSIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.GNOSIS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'xDAI',
        symbol: 'xDAI',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FUSE]: new Token({
        blockchain: BLOCKCHAIN_NAME.FUSE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'FUSE',
        symbol: 'FUSE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MOONBEAM]: new Token({
        blockchain: BLOCKCHAIN_NAME.MOONBEAM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'GLMR',
        symbol: 'GLMR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.CELO]: new Token({
        blockchain: BLOCKCHAIN_NAME.CELO,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BOBA]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BOBA_BSC]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA_BSC,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA_AVALANCHE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ASTAR_EVM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ASTAR_EVM,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ASTR',
        symbol: 'ASTR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ETHEREUM_POW]: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Ethereum PoW',
        symbol: 'ETHW',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.KAVA]: new Token({
        blockchain: BLOCKCHAIN_NAME.KAVA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'KAVA',
        symbol: 'KAVA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BITCOIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.BITCOIN,
        address: BitcoinWeb3Pure.nativeTokenAddress,
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8
    }),
    [BLOCKCHAIN_NAME.TRON]: new Token({
        blockchain: BLOCKCHAIN_NAME.TRON,
        address: TronWeb3Pure.nativeTokenAddress,
        name: 'TRX',
        symbol: 'TRX',
        decimals: 6
    }),
    [BLOCKCHAIN_NAME.BITGERT]: new Token({
        blockchain: BLOCKCHAIN_NAME.BITGERT,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Brise',
        symbol: 'BRISE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.OASIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.OASIS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ROSE',
        symbol: 'ROSE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.METIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.METIS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Metis token',
        symbol: 'METIS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.DFK]: new Token({
        blockchain: BLOCKCHAIN_NAME.DFK,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'JEWEL',
        symbol: 'JEWEL',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.KLAYTN]: new Token({
        blockchain: BLOCKCHAIN_NAME.KLAYTN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Klaytn',
        symbol: 'KLAY',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.VELAS]: new Token({
        blockchain: BLOCKCHAIN_NAME.VELAS,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Velas',
        symbol: 'VLX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SYSCOIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.SYSCOIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Syscoin',
        symbol: 'SYS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ICP]: new Token({
        blockchain: BLOCKCHAIN_NAME.ICP,
        address: IcpWeb3Pure.nativeTokenAddress,
        name: 'Internet Computer',
        symbol: 'ICP',
        decimals: 8
    }),
    [BLOCKCHAIN_NAME.KAVA_COSMOS]: new Token({
        blockchain: BLOCKCHAIN_NAME.KAVA_COSMOS,
        address: KavaCosmosWeb3Pure.nativeTokenAddress,
        name: 'Kava',
        symbol: 'KAVA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ZK_SYNC]: new Token({
        blockchain: BLOCKCHAIN_NAME.ZK_SYNC,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.PULSECHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.PULSECHAIN,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'PLS',
        symbol: 'PLS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.LINEA]: new Token({
        blockchain: BLOCKCHAIN_NAME.LINEA,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BASE]: new Token({
        blockchain: BLOCKCHAIN_NAME.BASE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MANTLE]: new Token({
        blockchain: BLOCKCHAIN_NAME.MANTLE,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'Mantle',
        symbol: 'MNT',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: new Token({
        blockchain: BLOCKCHAIN_NAME.MANTA_PACIFIC,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'MNT',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SCROLL]: new Token({
        blockchain: BLOCKCHAIN_NAME.SCROLL,
        address: EvmWeb3Pure.nativeTokenAddress,
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    })
};
