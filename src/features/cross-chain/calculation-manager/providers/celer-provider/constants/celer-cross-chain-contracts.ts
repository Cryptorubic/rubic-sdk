import { RubicSdkError } from 'src/common/errors';
import { CelerCrossChainContractData } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/celer-cross-chain-contract-data';
import { celerCrossChainContractsAddresses } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-cross-chain-contracts-addresses';
import { crossChainTradeProvidersData } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/cross-chain-trade-providers-data';
import {
    CelerCrossChainSupportedBlockchain,
    celerCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';

const celerCrossChainContracts: Record<
    CelerCrossChainSupportedBlockchain,
    CelerCrossChainContractData | null
> = celerCrossChainSupportedBlockchains.reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: null }),
    {} as Record<CelerCrossChainSupportedBlockchain, CelerCrossChainContractData | null>
);

export function getCelerCrossChainContract(
    blockchain: CelerCrossChainSupportedBlockchain
): CelerCrossChainContractData {
    const storedContract = celerCrossChainContracts[blockchain];
    if (storedContract) {
        return storedContract;
    }

    const pureProvidersData = crossChainTradeProvidersData[blockchain];
    const swapContractAddress = celerCrossChainContractsAddresses[blockchain];
    if (!pureProvidersData) {
        throw new RubicSdkError('Cross-Chain trade providers data has to be defined');
    }
    const providersData = pureProvidersData.map(providerData => ({
        // @ts-ignore Can't create instance of abstract class.
        provider: new providerData.ProviderClass(),
        methodSuffix: providerData.methodSuffix
    }));

    celerCrossChainContracts[blockchain] = new CelerCrossChainContractData(
        blockchain,
        swapContractAddress,
        providersData
    );

    return celerCrossChainContracts[blockchain]!;
}
