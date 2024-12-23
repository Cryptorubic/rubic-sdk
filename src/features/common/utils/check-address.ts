import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
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
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

async function checkAllChainsAddressCorrect(address: string): Promise<boolean> {
    const promises = [];
    const props = Object.getOwnPropertyNames(Web3Pure);
    for (const propertyName of props) {
        const isChainWeb3Pure = Object.values(CHAIN_TYPE).some(
            chainType => chainType === propertyName
        );
        if (isChainWeb3Pure) {
            const methodBody = Web3Pure[propertyName as keyof Web3Pure] as TypedWeb3Pure;
            promises.push(methodBody.isAddressCorrect(address));
        }
    }

    const resp = await Promise.all(promises);
    const isAddressCorrect = resp.some(isAddress => isAddress);

    return isAddressCorrect;
}

/**
 *
 * @param address
 * @param toBlockchain  is null when search goes through all chains
 * @param crossChainType
 */
export async function isAddressCorrect(
    address: string,
    toBlockchain: BlockchainName | null,
    crossChainType?: CrossChainTradeType | OnChainTradeType
): Promise<boolean> {
    try {
        if (!toBlockchain) {
            return checkAllChainsAddressCorrect(address);
        }

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
