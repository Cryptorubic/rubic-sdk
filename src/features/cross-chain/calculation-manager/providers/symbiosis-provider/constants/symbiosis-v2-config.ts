import { Config } from 'symbiosis-js-sdk';

export function getSymbiosisV2Config(): Config {
    return {
        advisor: {
            url: 'https://api-v2.symbiosis.finance/calculations'
        },
        omniPools: [
            {
                chainId: 56288,
                address: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
                oracle: '0x7775b274f0C3fA919B756b22A4d9674e55927ab8'
            },
            {
                chainId: 56288,
                address: '0xBcc2637DFa64999F75abB53a7265b5B4932e40eB',
                oracle: '0x628613064b1902a1A422825cf11B687C6f17961E'
            }
        ],
        chains: [
            {
                id: 1,
                rpc: 'https://rpc.ankr.com/eth',
                filterBlockOffset: 2000,
                waitForBlocksCount: 12,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                        symbol: 'USDC',
                        decimals: 6,
                        chainId: 1,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Symbiosis',
                        symbol: 'SIS',
                        address: '0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9',
                        chainId: 1,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15084.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/15084.png'
                        }
                    },
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        chainId: 1,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
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
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258',
                creamCompoundLens: '0xd400e22dcA840CC7E342DF1d9945684bBd587659',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 56,
                rpc: 'https://rpc.ankr.com/bsc',
                filterBlockOffset: 2000,
                waitForBlocksCount: 20,
                stables: [
                    {
                        name: 'BUSD Token',
                        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                        symbol: 'BUSD',
                        decimals: 18,
                        chainId: 56,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
                        }
                    },
                    {
                        name: 'USD Coin',
                        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                        symbol: 'USDC',
                        decimals: 18,
                        chainId: 56,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Ethereum Token',
                        symbol: 'ETH',
                        address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
                        chainId: 56,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
                router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
                dexFee: 25,
                metaRouter: '0x81aB74A9f9d7457fF47dfD102e78A340cF72EC39',
                metaRouterGateway: '0x79d930aBe53dd56B66Ed43f8f6a7C6a1b84655cA',
                bridge: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                synthesis: '0x6B1bbd301782FF636601fC594Cd7Bfe74871bfaA',
                portal: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
                fabric: '0xc17d768Bf4FdC6f20a4A0d8Be8767840D106D077',
                multicallRouter: '0x44b5d0F16Ad55c4e7113310614745e8771b963bB',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x589de0f0ccf905477646599bb3e5c622c84cc0ba',
                creamCompoundLens: '0x06fd4e17Dd35d0dE9FE17eeAE4e94fBA57fEF154',
                renGatewayRegistry: '0xf36666C230Fa12333579b9Bd6196CB634D6BC506',
                blocksPerYear: 0
            },
            {
                id: 43114,
                rpc: 'https://rpc.ankr.com/avalanche',
                filterBlockOffset: 2000,
                waitForBlocksCount: 30,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
                        symbol: 'USDC.e',
                        decimals: 6,
                        chainId: 43114,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'USD Coin',
                        address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
                        symbol: 'USDC',
                        decimals: 6,
                        chainId: 43114,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
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
                aavePoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
                creamComptroller: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4',
                creamCompoundLens: '0x5b4058A9000e86fe136Ac896352C4DFD539E32a1',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 137,
                rpc: 'https://rpc.ankr.com/polygon',
                filterBlockOffset: 2000,
                waitForBlocksCount: 60,
                stables: [
                    {
                        name: 'USD Coin (PoS)',
                        address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
                        symbol: 'USDC',
                        decimals: 6,
                        chainId: 137,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
                        chainId: 137,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
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
                aavePoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
                creamComptroller: '0x20CA53E2395FA571798623F1cFBD11Fe2C114c24',
                creamCompoundLens: '0xa7B0C2e904d597b89b4bf91927A3B90459f8bb9E',
                renGatewayRegistry: '0xf36666C230Fa12333579b9Bd6196CB634D6BC506',
                blocksPerYear: 0
            },
            {
                id: 40,
                rpc: 'https://mainnet.telos.net/evm',
                filterBlockOffset: 3000,
                waitForBlocksCount: 120,
                stables: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
                        chainId: 40,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                router: '0xb9667Cf9A495A123b0C43B924f6c2244f42817BE',
                dexFee: 25,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 2222,
                rpc: 'https://evm.kava.io/',
                filterBlockOffset: 2000,
                waitForBlocksCount: 30,
                stables: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
                        chainId: 2222,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                router: '0xA7544C409d772944017BB95B99484B6E0d7B6388',
                dexFee: 30,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 288,
                rpc: 'https://mainnet.boba.network',
                filterBlockOffset: 3000,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
                        symbol: 'USDC',
                        decimals: 6,
                        chainId: 288,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
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
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 43288,
                rpc: 'https://avax.boba.network',
                filterBlockOffset: 3000,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x126969743a6d300bab08F303f104f0f7DBAfbe20',
                        symbol: 'USDC.e',
                        decimals: 6,
                        chainId: 43288,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
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
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 56288,
                rpc: 'https://rpc.symbiosis.finance/56288',
                filterBlockOffset: 3000,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x9F98f9F312D23d078061962837042b8918e6aff2',
                        symbol: 'USDC',
                        decimals: 18,
                        chainId: 56288,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
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
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 324,
                rpc: 'https://mainnet.era.zksync.io',
                filterBlockOffset: 2000,
                waitForBlocksCount: 12,
                stables: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
                        chainId: 324,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
                        chainId: 324,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
                router: '0x8B791913eB07C32779a16750e3868aA8495F5964',
                dexFee: 30,
                metaRouter: '0x4f30036b5858f77F98d8D35c3b21BEb18916Ba9a',
                metaRouterGateway: '0x2F7c5901DeBFb7faD804Db800F226de3dd0cffd5',
                bridge: '0xb0D30aD9C1A7b303977DB7ea073a4329d930D94c',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x39dE19C9fF25693A2311AAD1dc5C790194084A39',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xe004DE550074856bD64Cc1A89A8B3b56bD3eAf31',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 42161,
                rpc: 'https://arb1.arbitrum.io/rpc',
                filterBlockOffset: 2000,
                waitForBlocksCount: 240,
                stables: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                        chainId: 42161,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'USD Coin (Arb1)',
                        symbol: 'USDC.e',
                        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                        chainId: 42161,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
                        chainId: 42161,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
                router: '0xD01319f4b65b79124549dE409D36F25e04B3e551',
                dexFee: 30,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 10,
                rpc: 'https://rpc.ankr.com/optimism',
                filterBlockOffset: 2000,
                waitForBlocksCount: 50,
                stables: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
                        chainId: 10,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0x4200000000000000000000000000000000000006',
                        chainId: 10,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
                router: '0x0000000000000000000000000000000000000000',
                dexFee: 0,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 42170,
                rpc: 'https://nova.arbitrum.io/rpc',
                filterBlockOffset: 2000,
                waitForBlocksCount: 60,
                stables: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0x750ba8b76187092B0D1E87E28daaf484d1b5273b',
                        chainId: 42170,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0x722e8bdd2ce80a4422e880164f2079488e115365',
                        chainId: 42170,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
                router: '0xEe01c0CD76354C383B8c7B4e65EA88D00B06f36f',
                dexFee: 30,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 1101,
                rpc: 'https://zkevm-rpc.com/',
                filterBlockOffset: 2000,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        symbol: 'USDC',
                        address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
                        chainId: 1101,
                        decimals: 6,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
                        chainId: 1101,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
                router: '0x0000000000000000000000000000000000000000',
                dexFee: 30,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            },
            {
                id: 59144,
                rpc: 'https://rpc.symbiosis.finance/59144',
                filterBlockOffset: 2000,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'Wrapped Ether',
                        symbol: 'WETH',
                        address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
                        chainId: 59144,
                        decimals: 18,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png'
                        }
                    }
                ],
                router: '0x0000000000000000000000000000000000000000',
                dexFee: 30,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
                aavePool: '0x0000000000000000000000000000000000000000',
                aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                creamCompoundLens: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000',
                blocksPerYear: 0
            }
        ]
    };
}
