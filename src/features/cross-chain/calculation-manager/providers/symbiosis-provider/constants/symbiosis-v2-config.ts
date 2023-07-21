import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Config } from 'symbiosis-js-sdk';

const testnetConfig = {
    minSwapAmountInUsd: 10,
    maxSwapAmountInUsd: 10000,
    advisor: {
        url: 'https://api.testnet.symbiosis.finance/calculations'
    },
    omniPool: {
        chainId: 97,
        address: '0x569D2a232F5f2a462673fAf184ED9640e8A9F4D8',
        oracle: '0xcE29b84160fe8B6Fc1c6E5aD66F1F43279F2F1C9'
    },
    chains: [
        {
            id: 5,
            rpc: 'https://rpc.ankr.com/eth_goerli',
            filterBlockOffset: 3000,
            waitForBlocksCount: 5,
            stables: [
                {
                    name: 'USD Coin',
                    address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
                    symbol: 'USDC',
                    isStable: true,
                    decimals: 6,
                    chainId: 5,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                    }
                }
            ],
            nerves: [],
            router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            dexFee: 30,
            metaRouter: '0x5302358dCFbF2881e5b5E537316786d8Ea242008',
            metaRouterGateway: '0x438D14b1Fd3C20C33Fa7EF6331AA3fC36bc0347E',
            bridge: '0x9f81fAcae42a7312f49A3E27098fC4d39e2c550d',
            synthesis: '0x0000000000000000000000000000000000000000',
            portal: '0x7d8B7b5f663E93D7F8970d0A61081Af03c63bB86',
            fabric: '0x0000000000000000000000000000000000000000',
            multicallRouter: '0xd655C2c9D558Bf8E3382f98eDADb84e866665139',
            aavePool: '0x0000000000000000000000000000000000000000',
            creamComptroller: '0x0000000000000000000000000000000000000000',
            renGatewayRegistry: '0x0000000000000000000000000000000000000000'
        },
        {
            id: 97,
            rpc: 'https://rpc.ankr.com/bsc_testnet_chapel',
            filterBlockOffset: 3000,
            waitForBlocksCount: 20,
            stables: [
                {
                    name: 'Binance USD',
                    address: '0x9a01bf917477dd9f5d715d188618fc8b7350cd22',
                    symbol: 'BUSD',
                    isStable: true,
                    decimals: 18,
                    chainId: 97,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png'
                    }
                },
                {
                    name: 'Synthetic USDC',
                    symbol: 'sUSDC',
                    address: '0x32Ac07C5D3D6002B853836a48EE8538C9CF29ad4',
                    chainId: 97,
                    chainFromId: 5,
                    decimals: 6,
                    isStable: true,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                    }
                },
                {
                    name: 'Synthetic USDT',
                    symbol: 'sUSDT',
                    address: '0x9505A4F9108aE474c8fAeC17a22e68566c6C12C8',
                    chainId: 97,
                    chainFromId: 43113,
                    decimals: 6,
                    isStable: true,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
                    }
                },
                {
                    name: 'Synthetic USDC',
                    symbol: 'sUSDC',
                    address: '0xA4bd5C28114341c53e347b17b67d551AFd455516',
                    chainId: 97,
                    chainFromId: 80001,
                    decimals: 6,
                    isStable: true,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                    }
                },
                {
                    name: 'Synthetic USDT',
                    symbol: 'sUSDT',
                    address: '0x8341Bc741cd653dC0BEb39D2C57562419B0A2C6E',
                    chainId: 97,
                    chainFromId: 8081,
                    decimals: 6,
                    isStable: true,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
                    }
                }
            ],
            nerves: [],
            router: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
            dexFee: 30,
            metaRouter: '0xd3F98c243374D79Bfd9a8ac03964623221D53F0f',
            metaRouterGateway: '0x4Ee7B1e8Ad6E1682318f1c47F83634dAa1197eEf',
            bridge: '0xB299eee0Ed46b7a34C01F2a01fc83a0B45aA88AF',
            synthesis: '0x08f5c28ff0622FeF758c2C3c2a5EAEeb63D60D4c',
            portal: '0x0000000000000000000000000000000000000000',
            fabric: '0x9B8D0e0765cDa999910ff31A2204080E1192EfC7',
            multicallRouter: '0x086D8d30822086941729DF294f0e52E42EdC17F9',
            aavePool: '0x0000000000000000000000000000000000000000',
            creamComptroller: '0x0000000000000000000000000000000000000000',
            renGatewayRegistry: '0x0000000000000000000000000000000000000000'
        },
        {
            id: 43113,
            rpc: 'https://rpc.ankr.com/avalanche_fuji',
            filterBlockOffset: 3000,
            waitForBlocksCount: 20,
            stables: [
                {
                    name: 'USDT',
                    symbol: 'USDT',
                    address: '0x9a01bf917477dd9f5d715d188618fc8b7350cd22',
                    chainId: 43113,
                    decimals: 6,
                    isStable: true,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
                    }
                }
            ],
            nerves: [],
            router: '0x4F86a87985a2eD1E843c0b93755Ac06A3DbCc55E',
            dexFee: 30,
            metaRouter: '0x8eC5387A2CdFA5315c05Fd7296C11406AeC2559e',
            metaRouterGateway: '0x80cD2d214ccBdcB214DEA5bC040c8c2002Dc9380',
            bridge: '0xcC0DB081360Eb259bdf6911976c51cAF1B72e845',
            synthesis: '0x0000000000000000000000000000000000000000',
            portal: '0x78Bb4D4872121f162BB3e938F0d10cf34E999648',
            fabric: '0x0000000000000000000000000000000000000000',
            multicallRouter: '0x8C9D3CE1D59d73259018dBC9859F6eBe62Bbf862',
            aavePool: '0x0000000000000000000000000000000000000000',
            creamComptroller: '0x0000000000000000000000000000000000000000',
            renGatewayRegistry: '0x0000000000000000000000000000000000000000'
        },
        {
            id: 80001,
            rpc: 'https://rpc.ankr.com/polygon_mumbai',
            filterBlockOffset: 3000,
            waitForBlocksCount: 60,
            stables: [
                {
                    name: 'USDT',
                    symbol: 'USDT',
                    address: '0x9a01bf917477dd9f5d715d188618fc8b7350cd22',
                    chainId: 80001,
                    decimals: 6,
                    isStable: true,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
                    }
                }
            ],
            nerves: [],
            router: '0xca33f6D096BDD7FcB28d708f631cD76E73Ecfc2d',
            dexFee: 30,
            metaRouter: '0x2636F6A85aB7bD438631a03e6E7cC6d6ae712642',
            metaRouterGateway: '0x85aDa6757f383577A8AB2a3492ac3E721CcFEAbb',
            bridge: '0x2578412aECCcc32f270A03cfBa25f6557aF4017b',
            synthesis: '0x0000000000000000000000000000000000000000',
            portal: '0x9ad7e9A0D18cC56303277dC5bF77D1910570509a',
            fabric: '0x0000000000000000000000000000000000000000',
            multicallRouter: '0xEc36ED7f5Be3006CF04F85d4851DbDB85b60C19E',
            aavePool: '0x0000000000000000000000000000000000000000',
            creamComptroller: '0x0000000000000000000000000000000000000000',
            renGatewayRegistry: '0x0000000000000000000000000000000000000000'
        },
        {
            id: 8081,
            rpc: 'https://liberty20.shardeum.org',
            filterBlockOffset: 3000,
            waitForBlocksCount: 1,
            stables: [
                {
                    name: 'USDT',
                    symbol: 'USDT',
                    address: '0xAED47A51AeFa6f95A388aDA3c459d94FF46fC4BB',
                    chainId: 8081,
                    decimals: 6,
                    isStable: true,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
                    }
                }
            ],
            nerves: [],
            router: '0xdeF8D4dc7fB633a0d944EABf8932BF729D61f011',
            dexFee: 30,
            metaRouter: '0xE52e3c838CC91C60a701E78B5043ba9eeEeb55db',
            metaRouterGateway: '0x13fF611B06bEb2A29a49cc3c825cD0eE74967bE3',
            bridge: '0x9D15297f42fEf485f2d061a012cfE699Cc49132B',
            synthesis: '0x0000000000000000000000000000000000000000',
            portal: '0xBC4454Ee01EC5B6517333bD716f5135042ca1e38',
            fabric: '0x0000000000000000000000000000000000000000',
            multicallRouter: '0x7dc13B605508F91Fcd3bf7803C2b96B43941B4E8',
            aavePool: '0x0000000000000000000000000000000000000000',
            creamComptroller: '0x0000000000000000000000000000000000000000',
            renGatewayRegistry: '0x0000000000000000000000000000000000000000'
        },
        {
            id: 534353,
            rpc: 'https://alpha-rpc.scroll.io/l2',
            filterBlockOffset: 2000,
            waitForBlocksCount: 20,
            stables: [
                {
                    name: 'Circle USD',
                    symbol: 'USDC',
                    address: '0x67aE69Fd63b4fc8809ADc224A9b82Be976039509',
                    chainId: 534353,
                    decimals: 6,
                    icons: {
                        large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                        small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                    }
                }
            ],
            nerves: [],
            router: '0xDe886ff69fE234c8db2e2694788e73aa6be8d0c7',
            dexFee: 30,
            metaRouter: '0xAED47A51AeFa6f95A388aDA3c459d94FF46fC4BB',
            metaRouterGateway: '0x8Daf3F19dD8a27554BaE525075E90Df4E56a4c46',
            bridge: '0x6fa0a77Bb9FC5AC9e9D9C26c101067486291d2B5',
            synthesis: '0x0000000000000000000000000000000000000000',
            portal: '0x7739E567B9626ca241bdC5528343F92F7e59Af37',
            fabric: '0x0000000000000000000000000000000000000000',
            multicallRouter: '0x9D15297f42fEf485f2d061a012cfE699Cc49132B',
            aavePool: '0x0000000000000000000000000000000000000000',
            // aavePoolDataProvider: '0x0000000000000000000000000000000000000000',
            creamComptroller: '0x0000000000000000000000000000000000000000',
            // creamCompoundLens: '0x0000000000000000000000000000000000000000',
            // blocksPerYear: 2336000,
            renGatewayRegistry: '0x0000000000000000000000000000000000000000'
        }
    ]
};

export function getSymbiosisV2Config(blockchain: BlockchainName): Config {
    if (BlockchainsInfo.isTestBlockchainName(blockchain)) {
        return testnetConfig;
    }
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
                filterBlockOffset: 2000,
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
                    },
                    {
                        name: 'Symbiosis Finance',
                        symbol: 'SIS',
                        address: '0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9',
                        chainId: 1,
                        decimals: 18,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15084.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/128x128/15084.png'
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
                filterBlockOffset: 2000,
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
                    },
                    {
                        name: 'USD Coin',
                        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                        symbol: 'USDC',
                        decimals: 18,
                        chainId: 56,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    },
                    {
                        name: 'SIS from Ethereum',
                        address: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
                        symbol: 'SIS',
                        decimals: 18,
                        chainId: 56,
                        isStable: true,
                        chainFromId: 1,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15084.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15084.png'
                        }
                    }
                ],
                nerves: [],
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
                creamComptroller: '0x589de0f0ccf905477646599bb3e5c622c84cc0ba',
                renGatewayRegistry: '0xf36666C230Fa12333579b9Bd6196CB634D6BC506'
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
                filterBlockOffset: 2000,
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
                filterBlockOffset: 3000,
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
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 2222,
                rpc: 'https://evm.kava.io/',
                filterBlockOffset: 2000,
                waitForBlocksCount: 30,
                stables: [
                    {
                        name: 'USDC',
                        symbol: 'USDC',
                        address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
                        chainId: 2222,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
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
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
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
                filterBlockOffset: 3000,
                waitForBlocksCount: 0,
                stables: [
                    {
                        name: 'USD Coin',
                        address: '0x126969743a6d300bab08F303f104f0f7DBAfbe20',
                        symbol: 'USDC.e',
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
                        name: 'Synthetic USDC',
                        symbol: 'sUSDC',
                        address: '0x5e19eFc6AC9C80bfAA755259c9fab2398A8E87eB',
                        chainId: 56288,
                        chainFromId: 56,
                        decimals: 18,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
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
                    },
                    {
                        name: 'Synthetic USDC',
                        symbol: 'sUSDC',
                        address: '0x437640130BAE97dAD55161a6F1AEC58d0F30fE8F',
                        chainId: 56288,
                        chainFromId: 2222,
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
                        address: '0xc6cc7e50a0f20268db1bab041ff18b2c7e97a9d3',
                        chainId: 56288,
                        chainFromId: 324,
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
                        address: '0xA8d058ed41B216175400E8B2CC8cD55853596462',
                        chainId: 56288,
                        chainFromId: 42161,
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
                        address: '0xf072f11Bf151038BD8732cd1088b7C98762b839C',
                        chainId: 56288,
                        chainFromId: 10,
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
            },
            {
                id: 324,
                rpc: 'https://mainnet.era.zksync.io',
                filterBlockOffset: 2000,
                waitForBlocksCount: 12,
                stables: [
                    {
                        name: 'USDC',
                        symbol: 'USDC',
                        address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
                        chainId: 324,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
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
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 42161,
                rpc: 'https://arb1.arbitrum.io/rpc',
                filterBlockOffset: 2000,
                waitForBlocksCount: 240,
                stables: [
                    {
                        name: 'USDC',
                        symbol: 'USDC',
                        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                        chainId: 42161,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
                router: '0x0000000000000000000000000000000000000000',
                dexFee: 0,
                metaRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
                metaRouterGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
                bridge: '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
                synthesis: '0x0000000000000000000000000000000000000000',
                portal: '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
                fabric: '0x0000000000000000000000000000000000000000',
                multicallRouter: '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
                aavePool: '0x0000000000000000000000000000000000000000',
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 10,
                rpc: 'https://rpc.ankr.com/optimism',
                filterBlockOffset: 2000,
                waitForBlocksCount: 50,
                stables: [
                    {
                        name: 'USDC',
                        symbol: 'USDC',
                        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
                        chainId: 10,
                        decimals: 6,
                        isStable: true,
                        icons: {
                            large: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
                            small: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
                        }
                    }
                ],
                nerves: [],
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
                creamComptroller: '0x0000000000000000000000000000000000000000',
                renGatewayRegistry: '0x0000000000000000000000000000000000000000'
            }
        ]
    };
}
