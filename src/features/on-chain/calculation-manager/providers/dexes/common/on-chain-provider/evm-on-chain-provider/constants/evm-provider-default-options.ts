import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { providerDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/constants/provider-default-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

export const evmProviderDefaultOptions: RequiredOnChainCalculationOptions = {
    ...providerDefaultOptions,
    gasCalculation: 'calculate',
    providerAddress: EvmWeb3Pure.EMPTY_ADDRESS
};
