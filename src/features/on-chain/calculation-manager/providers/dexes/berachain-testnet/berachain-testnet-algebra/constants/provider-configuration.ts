import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3AlgebraProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';

export const BERACHAIN_TESTNET_ALGEBRA_PROVIDER_CONFIGURATION: UniswapV3AlgebraProviderConfiguration =
    {
        wethAddress: wrappedNativeTokensList[BLOCKCHAIN_NAME.BERACHAIN]!.address,
        maxTransitTokens: 1
    };
