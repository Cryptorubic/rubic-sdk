import { Token } from 'src/common/tokens/token';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const wrappedNativeTokensList: Partial<Record<EvmBlockchainName, Token>> = {
    // @TODO REFACTOR
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
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: new Token({
        blockchain: BLOCKCHAIN_NAME.POLYGON_ZKEVM,
        address: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
        name: 'Wrapped Ether',
        symbol: 'Weth',
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
    [BLOCKCHAIN_NAME.BOBA_BSC]: new Token({
        blockchain: BLOCKCHAIN_NAME.BOBA_BSC,
        address: '0xC58aaD327D6D58D979882601ba8DDa0685B505eA',
        name: 'Wrapped Boba',
        symbol: 'WBOBA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ASTAR_EVM]: new Token({
        blockchain: BLOCKCHAIN_NAME.ASTAR_EVM,
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
        address: '0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481',
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
    }),
    [BLOCKCHAIN_NAME.KLAYTN]: new Token({
        blockchain: BLOCKCHAIN_NAME.KLAYTN,
        address: '0xe4f05a66ec68b54a58b17c22107b02e0232cc817',
        name: 'Wrapped KLAY',
        symbol: 'WKLAY',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.VELAS]: new Token({
        blockchain: BLOCKCHAIN_NAME.VELAS,
        address: '0xc579D1f3CF86749E05CD06f7ADe17856c2CE3126',
        name: 'Wrapped VLX',
        symbol: 'WVLX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SYSCOIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.SYSCOIN,
        address: '0xd3e822f3ef011Ca5f17D82C956D952D8d7C3A1BB',
        name: 'Wrapped SYS',
        symbol: 'WSYS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ZK_SYNC]: new Token({
        blockchain: BLOCKCHAIN_NAME.ZK_SYNC,
        address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
        name: 'Wrapped Ether',
        symbol: 'Weth',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.PULSECHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.PULSECHAIN,
        address: '0xa1077a294dde1b09bb078844df40758a5d0f9a27',
        name: 'Wrapped PLS',
        symbol: 'WPLS',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.LINEA]: new Token({
        blockchain: BLOCKCHAIN_NAME.LINEA,
        address: '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BASE]: new Token({
        blockchain: BLOCKCHAIN_NAME.BASE,
        address: '0x4200000000000000000000000000000000000006',
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MANTLE]: new Token({
        blockchain: BLOCKCHAIN_NAME.MANTLE,
        address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
        name: 'Wrapped Mantle',
        symbol: 'WMNT',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: new Token({
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
        address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MUMBAI]: new Token({
        blockchain: BLOCKCHAIN_NAME.MUMBAI,
        address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
        name: 'Wrapped Matic',
        symbol: 'WMATIC',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FUJI]: new Token({
        blockchain: BLOCKCHAIN_NAME.FUJI,
        address: '0x1d308089a2d1ced3f1ce36b1fcaf815b07217be3',
        name: 'Wrapped Avax',
        symbol: 'WAVAX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.GOERLI]: new Token({
        blockchain: BLOCKCHAIN_NAME.GOERLI,
        address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: new Token({
        blockchain: BLOCKCHAIN_NAME.SCROLL_SEPOLIA,
        address: '0x5300000000000000000000000000000000000004',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ARTHERA]: new Token({
        blockchain: BLOCKCHAIN_NAME.ARTHERA,
        address: '0xC7A183Ad373301d68f7E0Ee824c8c727C7D5B21d',
        name: 'Wrapped Arthera',
        symbol: 'WAA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.TAIKO]: new Token({
        blockchain: BLOCKCHAIN_NAME.TAIKO,
        address: '0x0011E559da84dde3f841e22dc33F3adbF184D84A',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SEPOLIA]: new Token({
        blockchain: BLOCKCHAIN_NAME.SEPOLIA,
        address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ETHEREUM_CLASSIC]: new Token({
        blockchain: BLOCKCHAIN_NAME.ETHEREUM_CLASSIC,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.FLARE]: new Token({
        blockchain: BLOCKCHAIN_NAME.FLARE,
        address: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d',
        name: 'Wrapper Flare',
        symbol: 'WFLR',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.IOTEX]: new Token({
        blockchain: BLOCKCHAIN_NAME.IOTEX,
        address: '0xa00744882684c3e4747faefd68d283ea44099d03',
        name: 'Wrapped IoTeX',
        symbol: 'WIOTX',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.THETA]: new Token({
        blockchain: BLOCKCHAIN_NAME.THETA,
        address: '0xaf537fb7e4c77c97403de94ce141b7edb9f7fcf0',
        name: 'Wrapped Theta',
        symbol: 'wTHETA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BITCOIN_CASH]: new Token({
        blockchain: BLOCKCHAIN_NAME.BITCOIN_CASH,
        address: '0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04',
        name: 'Wrapped BCH',
        symbol: 'WBCH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: new Token({
        blockchain: BLOCKCHAIN_NAME.MANTA_PACIFIC,
        address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.SCROLL]: new Token({
        blockchain: BLOCKCHAIN_NAME.SCROLL,
        address: '0x5300000000000000000000000000000000000004',
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BERACHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.BERACHAIN,
        address: '0x5806E416dA447b267cEA759358cF22Cc41FAE80F',
        name: 'Wrapped BERA',
        symbol: 'WBERA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BLAST_TESTNET]: new Token({
        blockchain: BLOCKCHAIN_NAME.BLAST_TESTNET,
        address: '0x4200000000000000000000000000000000000023',
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.ZETACHAIN]: new Token({
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf',
        name: 'Wrapped Zeta',
        symbol: 'WZETA',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.HOLESKY]: new Token({
        blockchain: BLOCKCHAIN_NAME.HOLESKY,
        address: '',
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18
    }),
    [BLOCKCHAIN_NAME.BLAST]: new Token({
        blockchain: BLOCKCHAIN_NAME.BLAST,
        address: '0x4300000000000000000000000000000000000004',
        name: 'Wrapped ETH',
        symbol: 'WETH',
        decimals: 18
    })
};
