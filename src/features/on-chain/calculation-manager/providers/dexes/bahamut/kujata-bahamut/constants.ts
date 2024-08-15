import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2ProviderConfiguration } from '../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultBahamutProviderConfiguration } from '../default-constants';

export const KUJATA_BAHAMUT_CONTRACT_ADDRESS = '0x90B74764FFfcA7aD47594A14c540794027beB50e';

export const kujataBahamutRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.BAHAMUT]!.address, //WFTN
    '0x2A3766bE51f95bece0853d88Ca82D5A26Fd803d5', //USDC.USDT
    '0xd0C1aE39D40DB875679a3329b2d5F71D5929c43f', //USDC.WFTN
    '0x1F267d46c146039026cD33F6429032B774a07173' //WFTN.USDT
];

export const KUJATA_BAHAMUT_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultBahamutProviderConfiguration,
    routingProvidersAddresses: kujataBahamutRoutingProvidersAddresses
};
