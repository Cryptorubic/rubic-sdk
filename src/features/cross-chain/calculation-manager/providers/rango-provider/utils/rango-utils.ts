import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { rangoApiBlockchainNames } from '../constants/rango-api-blockchain-names';
import { RangoCrossChainSupportedBlockchain } from '../model/rango-cross-chain-supported-blockchains';

export class RangoUtils {
    /**
     * @returns Query-param string in format `chainName.symbol--address`, chainName's compatible with rango-api
     */
    public static getFromToQueryParam(
        blockchainName: EvmBlockchainName,
        tokenSymbol: string,
        tokenAddress: string
    ): string {
        const rangoBlockchainName =
            rangoApiBlockchainNames[blockchainName as RangoCrossChainSupportedBlockchain];
        const param = `${rangoBlockchainName}.${tokenSymbol}--${tokenAddress}`;
        return param;
    }
}
