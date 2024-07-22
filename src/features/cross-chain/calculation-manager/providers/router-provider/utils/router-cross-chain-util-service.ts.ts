import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Injector } from 'src/core/injector/injector';

import { RouterCrossChainSupportedBlockchains } from '../constants/router-cross-chain-supported-chains';

export class RouterCrossChainUtilService {
    private static get tronWeb3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TRON);
    }

    public static async checkAndConvertAddress(
        blockchain: RouterCrossChainSupportedBlockchains,
        address: string
    ): Promise<string> {
        if (blockchain === BLOCKCHAIN_NAME.TRON) {
            const tronHexAddress = await this.tronWeb3Public.convertTronAddressToHex(address);
            return `0x${tronHexAddress.slice(2)}`;
        }

        return address;
    }
}
