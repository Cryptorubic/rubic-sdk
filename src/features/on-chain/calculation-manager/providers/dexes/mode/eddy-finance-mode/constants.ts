import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultModeProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/default-constants';

export const EDDY_FINANCE_MODE_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultModeProviderConfiguration,
    maxTransitTokens: 1
};

export const EDDY_FINANCE_MODE_SWAP_CONTRACT_ADDRESS = '0xCb0ca072EFb267F17289574Bf563e8dF05c7Ffe3';

export const EDDY_FINANCE_MODE_CALCULATE_CONTRACT_ADDRESS =
    '0xc1e624C810D297FD70eF53B0E08F44FABE468591';
