import { ethers } from 'ethers';
import { NotSupportedBlockchain, NotSupportedTokensError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import Web3 from 'web3';

import {
    EncodeSwapResponse,
    EncodeSwapSchema,
    FetchEncodedParamRequest,
    MesonChainsInfo,
    MesonLimitsResponse,
    MesonLimitsToken,
    SrcDstChainsIds,
    TxFeeResponse,
    TxStatusResponse
} from '../models/meson-api-types';

export class MesonCcrApiService {
    private static apiUrl = 'https://relayer.meson.fi/api/v1';

    public static async fetchTxChainsSymbols(
        sourceChain: BlockchainName,
        targetChain: BlockchainName
    ): Promise<SrcDstChainsIds> {
        const { result: chains } = await Injector.httpClient.get<MesonChainsInfo>(
            `${this.apiUrl}/list`
        );
        const sourceChainIdHex = Web3.utils.toHex(blockchainId[sourceChain]);
        const targetChainIdHex = Web3.utils.toHex(blockchainId[targetChain]);

        const ids = chains.reduce(
            (acc, chain) => {
                if (compareAddresses(chain.chainId, sourceChainIdHex)) acc[0] = chain.id;
                if (compareAddresses(chain.chainId, targetChainIdHex)) acc[1] = chain.id;

                return acc;
            },
            ['', ''] satisfies SrcDstChainsIds
        );

        return ids;
    }

    public static async fetchMesonFee(
        sourceAssetString: string,
        targetAssetString: string,
        amount: string
    ): Promise<string> {
        const res = await Injector.httpClient.post<TxFeeResponse>(`${this.apiUrl}/price`, {
            from: sourceAssetString,
            to: targetAssetString,
            amount
        });

        if ('error' in res || 'converted' in res.result) {
            throw new NotSupportedTokensError();
        }

        return res.result.totalFee;
    }

    public static async fetchTokenInfo(
        blockchain: BlockchainName,
        tokenAddress: string,
        isNative: boolean
    ): Promise<MesonLimitsToken> {
        const { result: chains } = await Injector.httpClient.get<MesonLimitsResponse>(
            `${this.apiUrl}/limits`
        );

        const chainId = blockchainId[blockchain];
        const hexChainId = Web3.utils.toHex(chainId);
        const foundChain = chains.find(chain => compareAddresses(chain.chainId, hexChainId));

        if (!foundChain) {
            throw new NotSupportedBlockchain();
        }

        const foundToken = isNative
            ? foundChain.tokens.find(token => !Object.hasOwn(token, 'addr'))
            : foundChain.tokens.find(token => compareAddresses(token.addr, tokenAddress));

        if (!foundToken) {
            throw new NotSupportedTokensError();
        }

        return foundToken;
    }

    public static async fetchInfoForTx(p: FetchEncodedParamRequest): Promise<EncodeSwapSchema> {
        const res = await Injector.httpClient.post<EncodeSwapResponse>(`${this.apiUrl}/swap`, {
            from: p.sourceAssetInfo,
            to: p.targetAssetInfo,
            amount: p.amount,
            fromAddress: p.fromAddress,
            fromContract: true,
            recipient: p.receiverAddress,
            dataToContract: ''
        });

        if ('error' in res) {
            if ('converted' in res.error) {
                throw new NotSupportedTokensError();
            }
            return res.error;
        } else {
            if ('converted' in res.result) {
                throw new NotSupportedTokensError();
            }
            return res.result;
        }
    }

    /**
     *
     * @param encoded The encoded swap data
     * @param initiator If on proxy - rubic-multiproxy address, if direct - wallet address
     */
    public static async fetchTxStatus(encoded: string, initiator: string): Promise<TxStatusData> {
        const packed = ethers.utils.solidityPack(['bytes32', 'address'], [encoded, initiator]);
        const swapId = ethers.utils.keccak256(packed);
        const res = await Injector.httpClient.get<TxStatusResponse>(
            `${this.apiUrl}/swap/${swapId}`
        );

        if ('error' in res || res.result.expired) {
            return {
                hash: null,
                status: TX_STATUS.FAIL
            };
        }

        if (res.result.EXECUTED) {
            return {
                hash: res.result.EXECUTED,
                status: TX_STATUS.SUCCESS
            };
        }

        return {
            hash: null,
            status: TX_STATUS.PENDING
        };
    }
}
