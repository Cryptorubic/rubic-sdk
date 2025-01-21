import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { nonEvmChainAddressCorrectResponse } from 'src/features/common/models/non-evm-chain-address-correct-response';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import {
    changenowApiBlockchain,
    ChangenowCrossChainSupportedBlockchain
} from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';

export async function isAddressCorrect(
    address: string,
    toBlockchain: BlockchainName,
    crossChainType?: CrossChainTradeType | OnChainTradeType
): Promise<boolean> {
    try {
        if (crossChainType === CROSS_CHAIN_TRADE_TYPE.CHANGENOW) {
            const chain =
                changenowApiBlockchain[toBlockchain as ChangenowCrossChainSupportedBlockchain];
            const response = await Injector.httpClient.get<nonEvmChainAddressCorrectResponse>(
                `https://api.changenow.io/v2/validate/address?currency=${chain.toLowerCase()}&address=${address}`
            );
            return response.result;
        }
        const blockchainProvider = Web3Pure[BlockchainsInfo.getChainType(toBlockchain)];
        return blockchainProvider.isAddressCorrect(address);
    } catch {
        return true;
    }
}
