import { RubicCrossChainContractData } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/rubic-cross-chain-contract-data';
import {
    RubicCrossChainSupportedBlockchain,
    rubicCrossChainSupportedBlockchains
} from '@features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-supported-blockchains';
import { crossChainTradeProvidersData } from '@features/cross-chain/constants/cross-chain-trade-providers-data';
import { rubicCrossChainContractsAddresses } from '@features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contracts-addresses';

const rubicCrossChainContracts: Record<
    RubicCrossChainSupportedBlockchain,
    RubicCrossChainContractData | null
> = rubicCrossChainSupportedBlockchains.reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: null }),
    {} as Record<RubicCrossChainSupportedBlockchain, RubicCrossChainContractData | null>
);

export function getRubicCrossChainContract(
    blockchain: RubicCrossChainSupportedBlockchain
): RubicCrossChainContractData {
    const storedContract = rubicCrossChainContracts[blockchain];
    if (storedContract) {
        return storedContract;
    }

    const pureProvidersData = crossChainTradeProvidersData[blockchain];
    if (!pureProvidersData) {
        throw new Error('[RUBIC SDK] Providers data has to be defined.');
    }
    const contractAddress = rubicCrossChainContractsAddresses[blockchain];
    const providersData = pureProvidersData.map(providerData => ({
        // @ts-ignore Can't create instance of abstract class.
        provider: new providerData.ProviderClass(),
        methodSuffix: providerData.methodSuffix
    }));

    rubicCrossChainContracts[blockchain] = new RubicCrossChainContractData(
        blockchain,
        contractAddress,
        providersData
    );

    return rubicCrossChainContracts[blockchain]!;
}
