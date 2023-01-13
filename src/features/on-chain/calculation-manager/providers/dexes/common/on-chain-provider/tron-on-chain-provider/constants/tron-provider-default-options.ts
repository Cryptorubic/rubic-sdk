import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { providerDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/constants/provider-default-options';

export const tronProviderDefaultOptions: RequiredOnChainCalculationOptions = {
    ...providerDefaultOptions,
    gasCalculation: 'disabled',
    providerAddress: TronWeb3Pure.EMPTY_ADDRESS
};
