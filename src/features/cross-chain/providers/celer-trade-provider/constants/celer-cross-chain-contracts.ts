import { rubicCrossChainContractsAddresses } from 'src/features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contracts-addresses';
import { RubicSdkError } from 'src/common/errors';
import {
    CelerCrossChainSupportedBlockchain,
    celerCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { CelerCrossChainContractData } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';
import { celerCrossChainContractsAddresses } from 'src/features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-contracts-addresses';
import { crossChainTradeProvidersData } from 'src/features/cross-chain/constants/cross-chain-trade-providers-data';

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
    const mainContractAddress = rubicCrossChainContractsAddresses[blockchain];
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
        providersData,
        mainContractAddress
    );

    return celerCrossChainContracts[blockchain]!;
}
