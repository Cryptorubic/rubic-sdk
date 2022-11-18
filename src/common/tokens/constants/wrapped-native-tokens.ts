import { Token } from 'src/common/tokens/token';
import { BlockchainName, BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const wrappedNativeTokensList: Record<BlockchainName, Token> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        name: 'Wrapped BNB',
        symbol: 'WBNB',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.POLYGON]: new Token({
        blockchain: BLOCKCHAIN_NAME.POLYGON,
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        name: 'Wrapped Matic',
        symbol: 'WMATIC',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.AVALANCHE]: new Token({
        blockchain: BLOCKCHAIN_NAME.AVALANCHE,
        address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        name: 'WAVAX',
        symbol: 'WAVAX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MOONRIVER]: new Token({
        blockchain: BLOCKCHAIN_NAME.MOONRIVER,
        address: '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d',
        name: 'Wrapped MOVR',
        symbol: 'WMOVR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FANTOM]: new Token({
        blockchain: BLOCKCHAIN_NAME.FANTOM,
        address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
        name: 'Wrapped Fantom',
        symbol: 'WFTM',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.HARMONY]: new Token({
        blockchain: BLOCKCHAIN_NAME.HARMONY,
        address: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a',
        name: 'Wrapped ONE',
        symbol: 'WONE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ARBITRUM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ARBITRUM,
        address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.AURORA]: new Token({
        blockchain: BLOCKCHAIN_NAME.AURORA,
        address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.TELOS]: new Token({
        blockchain: BLOCKCHAIN_NAME.TELOS,
        address: '0xd102ce6a4db07d247fcc28f366a623df0938ca9e',
        name: 'Wrapped Telos',
        symbol: 'WTLOS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SOLANA]: new Token({
        blockchain: BLOCKCHAIN_NAME.SOLANA,
        address: '@TODO SOLANA',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 24
    }),
    [BLOCKCHAIN_NAME.NEAR]: new Token({
        blockchain: BLOCKCHAIN_NAME.NEAR,
        address: '@TODO NEAR',
        name: 'NEAR',
        symbol: 'NEAR',
        decimals: 24
    }),
    [BLOCKCHAIN_NAME.OPTIMISM]: new Token({
        blockchain: BLOCKCHAIN_NAME.OPTIMISM,
        address: '0x4200000000000000000000000000000000000006',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.CRONOS]: new Token({
        blockchain: BLOCKCHAIN_NAME.CRONOS,
        address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
        name: 'Wrapped CRO',
        symbol: 'WCRO',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
        address: '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
        name: 'Wrapped OKT',
        symbol: 'WOKT',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.GNOSIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.GNOSIS,
        address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
        name: 'Wrapped XDAI',
        symbol: 'WXDAI',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FUSE]: new Token({
        blockchain: BLOCKCHAIN_NAME.FUSE,
        address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
        name: 'Wrapped Fuse',
        symbol: 'WFUSE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MOONBEAM]: new Token({
        blockchain: BLOCKCHAIN_NAME.MOONBEAM,
        address: '0xAcc15dC74880C9944775448304B263D191c6077F',
        name: 'Wrapped GLMR',
        symbol: 'WGLMR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.CELO]: new Token({
        blockchain: BLOCKCHAIN_NAME.CELO,
        address: '0x122013fd7df1c6f636a5bb8f03108e876548b455',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BOBA]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA,
        address: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ASTAR]: new Token({
        blockchain: BLOCKCHAIN_NAME.ASTAR,
        address: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
        name: 'Wrapped Astar',
        symbol: 'WASTR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ETHEREUM_POW]: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        name: 'Wrapped Ether PoW',
        symbol: 'WETHw',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.KAVA]: new Token({
        blockchain: BLOCKCHAIN_NAME.KAVA,
        address: '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b',
        name: 'Wrapped Kava',
        symbol: 'WKAVA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BITCOIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.BITCOIN,
        address: '',
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8
    }),
    [BLOCKCHAIN_NAME.TRON]: new Token({
        blockchain: BLOCKCHAIN_NAME.TRON,
        address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
        name: 'Wrapped TRX',
        symbol: 'WTRX',
        decimals: 6
    }),
    [BLOCKCHAIN_NAME.BITGERT]: new Token({
        blockchain: BLOCKCHAIN_NAME.BITGERT,
        address: '0x0eb9036cbE0f052386f36170c6b07eF0a0E3f710',
        name: 'Wrapped BRISE',
        symbol: 'WBRISE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.OASIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.OASIS,
        address: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
        name: 'Wrapped ROSE',
        symbol: 'WROSE',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.METIS]: new Token({
        blockchain: BLOCKCHAIN_NAME.METIS,
        address: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000',
        name: 'Wrapped METIS',
        symbol: 'WMETIS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.DFK]: new Token({
        blockchain: BLOCKCHAIN_NAME.DFK,
        address: '0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260',
        name: 'Wrapped JEWEL',
        symbol: 'WJEWEL',
        decimals: 18
    })
};
