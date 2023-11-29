import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RangoSupportedBlockchain } from './rango-supported-blockchains';

/**
 * @property {string} from 
 *Combine fromBlockchainName(!!!!!!!!!several chain-names in rango-api are different with Rubic: Avalanche in rango - `AVAX_CCHAIN`, in rubic - `AVALANCHE`),
fromTokenSymbol(e.g. ETH, BNB etc.) and fromTokenContractAddress
 *and should look like  `blockchainName.tokenSymbol--tokenAddress` without spaces
 * @property {string} to same as `from` but with data of target token
 * @property {string} amount amount of `from` token to exchange - use Web3Pure.toWei(tokenAmount) to get in string type
 * @property {string} slippage Amount of user's preferred slippage in percent
 * @property {string} fromAddress User wallet address
 * @property {string} toAddress Destination wallet address
 * @property {RangoSupportedBlockchain[]} swappers List of all accepted swappers (e.g. providers), an empty list means no filter is required
 * @property {boolean} [swappersExclude] - Indicates include/exclude mode for the swappers param
 */
export interface RangoSwapQueryParams {
    apiKey: string;
    from: string;
    to: string;
    amount: string;
    slippage: number;
    fromAddress: string;
    toAddress: string;
    swappers?: RangoSupportedBlockchain[];
    swappersExclude?: boolean;
}

export interface RangoBestRouteQueryParams {
    apiKey: string;
    from: string;
    to: string;
    amount: string;
    slippage?: number;
    swappers?: EvmBlockchainName[];
    swappersExclude?: boolean;
}

/**
 * @property {string} apiKey
 * @property {string} requestId Random UUID returned in swap/quote methodes in response
 * @property {string} srcTxHash In Rango-api used as `txId` queryParam in getTxStatus request
 */
export interface RangoTxStatusQueryParams {
    apiKey: string;
    requestId: string;
    srcTxHash: string;
}
