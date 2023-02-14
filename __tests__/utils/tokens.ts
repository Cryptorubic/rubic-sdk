import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Token } from 'src/common/tokens';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

export const TOKENS = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        ETH: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: EvmWeb3Pure.nativeTokenAddress,
            decimals: 18,
            symbol: 'ETH',
            name: 'Ethereum'
        }),
        USDT: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            decimals: 6,
            symbol: 'USDT',
            name: 'Tether USD'
        }),
        RBC: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
            decimals: 18,
            symbol: 'RBC',
            name: 'Rubic'
        }),
        WETH: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            decimals: 18,
            symbol: 'WETH',
            name: 'Wrapped Ether'
        }),
        DAI: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            decimals: 18,
            symbol: 'DAI',
            name: 'Dai Stablecoin'
        }),
        WBTC: new Token({
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            decimals: 8,
            symbol: 'WBTC',
            name: 'Wrapped BTC'
        })
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        MATIC: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: EvmWeb3Pure.nativeTokenAddress,
            decimals: 18,
            symbol: 'MAT',
            name: 'Matoc'
        }),
        WMATIC: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
            decimals: 18,
            symbol: 'WMATIC',
            name: 'Wrapped Matic'
        }),
        WETH: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
            decimals: 18,
            symbol: 'WETH',
            name: 'Wrapped Ether'
        }),
        USDT: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
            decimals: 6,
            symbol: 'USDT',
            name: '(PoS) Tether USD'
        }),
        DAI: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            decimals: 18,
            symbol: 'DAI',
            name: '(PoS) Dai Stablecoin'
        }),
        USDC: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
            decimals: 6,
            symbol: 'USDC',
            name: 'USD Coin (PoS)'
        }),
        QUICK: new Token({
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
            decimals: 18,
            symbol: 'QUICK',
            name: 'Quickswap'
        })
    }
};

export const TOKENS_HOLDERS: Partial<Record<BlockchainName, Record<string, string>>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3': '0x0541f3300307984984a587aeb7c34139e19124fa', // RBC
        '0xdac17f958d2ee523a2206206994597c13d831ec7': '0x5754284f345afc66a98fbb0a0afe71e0f007b949' // USDT
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT
    }
};
