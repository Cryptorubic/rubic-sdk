import { defaultBlastProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/default-constants';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

export const UNISWAP_V2_BLAST_CONTRACT_ADDRESS = '0x0998bEc51D95EAa75Ffdf465D5deD16aEd2ba2fe';

export const UNISWAP_V2_BLAST_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultBlastProviderConfiguration,
    maxTransitTokens: 1
};
