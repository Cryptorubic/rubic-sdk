import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { StargateV2BridgeToken, stargateV2BridgeToken } from './stargate-v2-bridge-token';
import { StargateV2SupportedBlockchains } from './stargate-v2-cross-chain-supported-blockchains';

type StargateV2ContractAddress = Record<
    StargateV2SupportedBlockchains,
    Partial<Record<StargateV2BridgeToken, string>>
>;

export const stargateV2ContractAddress: StargateV2ContractAddress = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        [stargateV2BridgeToken.ETH]: '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
        [stargateV2BridgeToken.USDC]: '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
        [stargateV2BridgeToken.USDT]: '0x933597a323Eb81cAe705C5bC29985172fd5A3973',
        [stargateV2BridgeToken.METIS]: '0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3',
        [stargateV2BridgeToken.METH]: '0x268Ca24DAefF1FaC2ed883c598200CcbB79E931D'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [stargateV2BridgeToken.USDT]: '0x138EB30f73BC423c6455C53df6D89CB01d9eBc63'
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        [stargateV2BridgeToken.USDC]: '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
        [stargateV2BridgeToken.USDT]: '0x22BdF9633F3e679785638Db690b85dC0Dc8B35B8'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        [stargateV2BridgeToken.USDC]: '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
        [stargateV2BridgeToken.USDT]: '0xd47b03ee6d86Cf251ee7860FB2ACf9f91B9fD4d7'
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        [stargateV2BridgeToken.ETH]: '0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F',
        [stargateV2BridgeToken.USDC]: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
        [stargateV2BridgeToken.USDT]: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0'
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        [stargateV2BridgeToken.ETH]: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
        [stargateV2BridgeToken.USDC]: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
        [stargateV2BridgeToken.USDT]: '0x19cFCE47eD54a88614648DC3f19A5980097007dD'
    },
    [BLOCKCHAIN_NAME.METIS]: {
        [stargateV2BridgeToken.METIS]: '0xD9050e7043102a0391F81462a3916326F86331F0',
        [stargateV2BridgeToken.ETH]: '0x36ed193dc7160D3858EC250e69D12B03Ca087D08',
        [stargateV2BridgeToken.USDT]: '0x4dCBFC0249e8d5032F89D6461218a9D2eFff5125'
    },
    [BLOCKCHAIN_NAME.LINEA]: {
        [stargateV2BridgeToken.ETH]: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075'
    },
    [BLOCKCHAIN_NAME.MANTLE]: {
        [stargateV2BridgeToken.WETH]: '0x4c1d3Fc3fC3c177c3b633427c2F769276c547463',
        [stargateV2BridgeToken.USDC]: '0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC',
        [stargateV2BridgeToken.USDT]: '0xa81274AFac523D639DbcA2C32c1470f1600cCEBe',
        [stargateV2BridgeToken.METH]: '0xF7628d84a2BbD9bb9c8E686AC95BB5d55169F3F1'
    },
    [BLOCKCHAIN_NAME.BASE]: {
        [stargateV2BridgeToken.ETH]: '0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7',
        [stargateV2BridgeToken.USDC]: '0x27a16dc786820B16E5c9028b75B99F6f604b5d26'
    },
    [BLOCKCHAIN_NAME.KAVA]: {
        [stargateV2BridgeToken.USDT]: '0x41A5b0470D96656Fb3e8f68A218b39AdBca3420b'
    },
    [BLOCKCHAIN_NAME.SCROLL]: {
        [stargateV2BridgeToken.ETH]: '0xC2b638Cb5042c1B3c5d5C969361fB50569840583',
        [stargateV2BridgeToken.USDC]: '0x3Fc69CC4A842838bCDC9499178740226062b14E4'
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        [stargateV2BridgeToken.USDC]: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075'
    },
    [BLOCKCHAIN_NAME.KLAYTN]: {
        [stargateV2BridgeToken.ETH]: '0xBB4957E44401a31ED81Cab33539d9e8993FA13Ce',
        [stargateV2BridgeToken.USDC]: '0x01A7c805cc47AbDB254CD8AaD29dE5e447F59224',
        [stargateV2BridgeToken.USDT]: '0x8619bA1B324e099CB2227060c4BC5bDEe14456c6'
    },
    [BLOCKCHAIN_NAME.IOTA]: {
        [stargateV2BridgeToken.ETH]: '0x9c2dc7377717603eB92b2655c5f2E7997a4945BD',
        [stargateV2BridgeToken.USDC]: '0x8e8539e4CcD69123c623a106773F2b0cbbc58746',
        [stargateV2BridgeToken.USDT]: '0x77C71633C34C3784ede189d74223122422492a0f'
    },
    [BLOCKCHAIN_NAME.TAIKO]: {
        [stargateV2BridgeToken.USDC]: '0x77C71633C34C3784ede189d74223122422492a0f',
        [stargateV2BridgeToken.USDT]: '0x1C10CC06DC6D35970d1D53B2A23c76ef370d4135'
    },
    [BLOCKCHAIN_NAME.SEI]: {
        [stargateV2BridgeToken.WETH]: '0x5c386D85b1B82FD9Db681b9176C8a4248bb6345B'
    }
};
