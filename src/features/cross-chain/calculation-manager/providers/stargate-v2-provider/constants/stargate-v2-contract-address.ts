import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { StargateV2BridgeToken, stargateV2BridgeToken } from './stargate-v2-bridge-token';
import { StargateV2SupportedBlockchains } from './stargate-v2-cross-chain-supported-blockchains';

type StargateV2ContractAddress = Record<
    StargateV2SupportedBlockchains,
    Partial<Record<StargateV2BridgeToken, string>>
>;

export const chainsWithoutPoolBalanceMethodOnContract = [
    BLOCKCHAIN_NAME.TAIKO,
    BLOCKCHAIN_NAME.SEI,
    BLOCKCHAIN_NAME.FLARE,
    BLOCKCHAIN_NAME.GRAVITY,
    BLOCKCHAIN_NAME.BERACHAIN
] as const;

export const stargateV2ContractAddress: StargateV2ContractAddress = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        [stargateV2BridgeToken.ETH]: '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
        [stargateV2BridgeToken.USDC]: '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
        [stargateV2BridgeToken.USDT]: '0x933597a323Eb81cAe705C5bC29985172fd5A3973',
        [stargateV2BridgeToken.METIS]: '0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3',
        [stargateV2BridgeToken.METH]: '0x268Ca24DAefF1FaC2ed883c598200CcbB79E931D'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [stargateV2BridgeToken.USDT]: '0x138EB30f73BC423c6455C53df6D89CB01d9eBc63',
        [stargateV2BridgeToken.USDC]: '0x962Bd449E630b0d928f308Ce63f1A21F02576057'
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        [stargateV2BridgeToken.USDC]: '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
        [stargateV2BridgeToken.USDT]: '0x12dC9256Acc9895B076f6638D628382881e62CeE'
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
        [stargateV2BridgeToken.WETH]: '0x36ed193dc7160D3858EC250e69D12B03Ca087D08',
        [stargateV2BridgeToken.mUSD]: '0x4dCBFC0249e8d5032F89D6461218a9D2eFff5125'
    },
    [BLOCKCHAIN_NAME.LINEA]: {
        [stargateV2BridgeToken.ETH]: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075'
    },
    [BLOCKCHAIN_NAME.MANTLE]: {
        [stargateV2BridgeToken.WETH]: '0x4c1d3Fc3fC3c177c3b633427c2F769276c547463',
        [stargateV2BridgeToken.USDC]: '0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC',
        [stargateV2BridgeToken.USDT]: '0xB715B85682B731dB9D5063187C450095c91C57FC',
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
        [stargateV2BridgeToken.USDCe]: '0x3Fc69CC4A842838bCDC9499178740226062b14E4'
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        [stargateV2BridgeToken.USDC]: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075'
    },
    // [BLOCKCHAIN_NAME.KLAYTN]: {
    //     [stargateV2BridgeToken.WETH]: '0x55acee547df909cf844e32dd66ee55a6f81dc71b',
    //     [stargateV2BridgeToken.USDC]: '0xe2053bcf56d2030d2470fb454574237cf9ee3d4b',
    //     [stargateV2BridgeToken.USDT]: '0x9025095263d1e548dc890a7589a4c78038ac40ab'
    // },
    [BLOCKCHAIN_NAME.TAIKO]: {
        // contract StargateOFTUSDC
        [stargateV2BridgeToken.USDC]: '0x77C71633C34C3784ede189d74223122422492a0f',
        // contract StargateOFTUSDT
        [stargateV2BridgeToken.USDT]: '0x1C10CC06DC6D35970d1D53B2A23c76ef370d4135'
    },
    // [BLOCKCHAIN_NAME.IOTA]: {
    //     [stargateV2BridgeToken.ETH]: '0x9c2dc7377717603eB92b2655c5f2E7997a4945BD',
    //     [stargateV2BridgeToken.USDC]: '0x8e8539e4CcD69123c623a106773F2b0cbbc58746',
    //     [stargateV2BridgeToken.USDT]: '0x77C71633C34C3784ede189d74223122422492a0f'
    // },
    [BLOCKCHAIN_NAME.SEI]: {
        // contract OFTTokenETH
        [stargateV2BridgeToken.WETH]: '0x5c386D85b1B82FD9Db681b9176C8a4248bb6345B'
    },
    [BLOCKCHAIN_NAME.FLARE]: {
        [stargateV2BridgeToken.USDC]: '0x77C71633C34C3784ede189d74223122422492a0f',
        [stargateV2BridgeToken.USDT]: '0x1C10CC06DC6D35970d1D53B2A23c76ef370d4135',
        [stargateV2BridgeToken.WETH]: '0x8e8539e4CcD69123c623a106773F2b0cbbc58746'
    },
    [BLOCKCHAIN_NAME.GRAVITY]: {
        [stargateV2BridgeToken.USDC]: '0xC1B8045A6ef2934Cf0f78B0dbD489969Fa9Be7E4',
        [stargateV2BridgeToken.USDT]: '0x0B38e83B86d491735fEaa0a791F65c2B99535396',
        [stargateV2BridgeToken.WETH]: '0x17d65bF79E77B6Ab21d8a0afed3bC8657d8Ee0B2'
    },
    [BLOCKCHAIN_NAME.BERACHAIN]: {
        [stargateV2BridgeToken.WETH]: '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B',
        [stargateV2BridgeToken.USDC]: '0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398'
    },
    [BLOCKCHAIN_NAME.UNICHAIN]: {
        [stargateV2BridgeToken.ETH]: '0xe9aBA835f813ca05E50A6C0ce65D0D74390F7dE7'
    }
};
