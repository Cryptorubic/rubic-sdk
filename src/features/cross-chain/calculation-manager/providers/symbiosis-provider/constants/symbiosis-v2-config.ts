import { Config } from 'symbiosis-js-sdk';

export function getSymbiosisV2Config(): Config {
    return {
        minSwapAmountInUsd: 10,
        maxSwapAmountInUsd: 5000000,
        advisor: {
            url: 'https://api-v2.symbiosis.finance/calculations'
        },
        omniPool: {
            chainId: 56288,
            address: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
            oracle: '0x7775b274f0C3fA919B756b22A4d9674e55927ab8'
        },
        chains: [
            {
                id: 1,
                rpc: 'https://rpc.ankr.com/eth',
                filterBlockOffset: 3000,
                waitForBlocksCount: 12,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                        symbol: 'USDC',
                        decimals: 6,
                        chainId: 1,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
                dexFee: 30,
                metaRouter: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
                metaRouterGateway: '0x25bEE8C21D1d0ec2852302fd7E674196EA298eC6',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0x49d3Fc00f3ACf80FABCb42D7681667B20F60889A',
                aavePool: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 56,
                rpc: 'https://rpc.ankr.com/bsc',
                filterBlockOffset: 3000,
                waitForBlocksCount: 20,
                stables: [
                    {
                        name: 'Binance USD',
                        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                        symbol: 'BUSD',
                        decimals: 18,
                        chainId: 56,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
                        }
                    }
                ],
                nerves: [],
                router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
                dexFee: 25,
                metaRouter: '0x81aB74A9f9d7457fF47dfD102e78A340cF72EC39',
                metaRouterGateway: '0x79d930aBe53dd56B66Ed43f8f6a7C6a1b84655cA',
                bridge: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0x44b5d0F16Ad55c4e7113310614745e8771b963bB',
                aavePool: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x589de0f0ccf905477646599bb3e5c622c84cc0ba',
                renGatewayRegistry: '0xf36666C230Fa12333579b9Bd6196CB634D6BC506'
            },
            {
                id: 43114,
                rpc: 'https://rpc.ankr.com/avalanche',
                filterBlockOffset: 3000,
                waitForBlocksCount: 30,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
                        symbol: 'USDC.e',
                        decimals: 6,
                        chainId: 43114,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
                dexFee: 30,
                metaRouter: '0xf1C374D065719Ce1Fdc63E2c5C13146813c0A83b',
                metaRouterGateway: '0x384157027B1CDEAc4e26e3709667BB28735379Bb',
                bridge: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xDc9a6a26209A450caC415fb78487e907c660cf6a',
                aavePool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
                creamComptroller: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 137,
                rpc: 'https://rpc.ankr.com/polygon',
                filterBlockOffset: 3000,
                waitForBlocksCount: 60,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
                        symbol: 'USDC',
                        isStable: true,
                        decimals: 6,
                        chainId: 137,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
                dexFee: 30,
                metaRouter: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
                metaRouterGateway: '0x25bEE8C21D1d0ec2852302fd7E674196EA298eC6',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xc5B61b9abC3C6229065cAD0e961aF585C5E0135c',
                aavePool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
                creamComptroller: '0x20CA53E2395FA571798623F1cFBD11Fe2C114c24',
                renGatewayRegistry: '0xf36666C230Fa12333579b9Bd6196CB634D6BC506'
            },
            {
                id: 40,
                rpc: 'https://mainnet.telos.net/evm',
                filterBlockOffset: 4900,
                waitForBlocksCount: 120,
                stables: [
                    {
                        name: 'USDC',
                        symbol: 'USDC',
                        address: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
                        chainId: 40,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0xf9678db1ce83f6f51e5df348e2cc842ca51efec1',
                dexFee: 25,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
                aavePool: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 288,
                rpc: 'https://mainnet.boba.network',
                filterBlockOffset: 4900,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
                        symbol: 'USDC',
                        decimals: 6,
                        chainId: 288,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                dexFee: 30,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0x506803495B1876FE1fA6Cd9dC65fB060057A4Cc3',
                aavePool: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 43288,
                rpc: 'https://avax.boba.network',
                filterBlockOffset: 4900,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x126969743a6d300bab08F303f104f0f7DBAfbe20',
                        symbol: 'USDC',
                        decimals: 6,
                        chainId: 43288,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                dexFee: 30,
                metaRouter: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
                metaRouterGateway: '0xE82948b631Cf822c81b09fA5ae393B24A4820808',
                bridge: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
                aavePool: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 56288,
                rpc: 'https://bnb.boba.network',
                filterBlockOffset: 3000,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x9F98f9F312D23d078061962837042b8918e6aff2',
                        symbol: 'USDC',
                        isStable: true,
                        decimals: 18,
                        chainId: 56288,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Synthetic USDC',
                        symbol: 'sUSDC',
                        address: '0x7d6EC42b5d9566931560411a8652Cea00b90d982',
                        chainId: 56288,
                        chainFromId: 1,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Synthetic BUSD',
                        symbol: 'sBUSD',
                        address: '0x1a25BEB8E75626ADDb983d46fbDfcE5fdC29Ae58',
                        chainId: 56288,
                        chainFromId: 56,
                        decimals: 18,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
                        }
                    },
                    {
                        name: 'Synthetic USDC.e',
                        symbol: 'sUSDC.e',
                        address: '0x6dF9C221F52537DFD63d70721EEAA0C4d4472C18',
                        chainId: 56288,
                        chainFromId: 43114,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Synthetic USDC',
                        symbol: 'sUSDC',
                        address: '0x59AA2e5F628659918A4890A2a732E6C8bD334E7A',
                        chainId: 56288,
                        chainFromId: 137,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Synthetic USDC',
                        symbol: 'sUSDC',
                        address: '0x1a3d48492Cd334AD140587091AC382E5695a4934',
                        chainId: 56288,
                        chainFromId: 288,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Synthetic USDC.e',
                        symbol: 'sUSDC.e',
                        address: '0xa9441f2995763e38d18A725646b00D90938d2FBf',
                        chainId: 56288,
                        chainFromId: 43288,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Synthetic USDC',
                        symbol: 'sUSDC',
                        address: '0x7Af28c655F1EF73E1Fb15204f025A25D686A3Ca7',
                        chainId: 56288,
                        chainFromId: 40,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
                dexFee: 30,
                metaRouter: '0xB79A4F5828eb55c10D7abF4bFe9a9f5d11aA84e0',
                metaRouterGateway: '0x37E44E4400A43F0c27ed42cF6EBEE3493A3e4d2f',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                portal: '0x0000000000000000000000000000000000000000',
                fabric: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
                multicallRouter: '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
                aavePool: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            }
        ]
    };
}
