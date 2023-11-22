import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { rangoApiBlockchainNames } from '../constants/rango-api-blockchain-names';
import { RangoCrossChainSupportedBlockchain } from '../model/rango-cross-chain-supported-blockchains';

export class RangoUtils {
    public static getFromToQueryParam(
        fromBlockchainName: EvmBlockchainName,
        tokenSymbol: string,
        fromAddress: string
    ): string {
        const rangoBlockchainName =
            rangoApiBlockchainNames[fromBlockchainName as RangoCrossChainSupportedBlockchain];
        const param = `${rangoBlockchainName}.${tokenSymbol}--${fromAddress}`;
        return param;
    }
}
