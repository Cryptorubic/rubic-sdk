import { Address } from '@ton/core';
import BigNumber from 'bignumber.js';
import { nativeTokensStruct } from 'src/common/tokens/constants/native-token-struct';
import pTimeout from 'src/common/utils/p-timeout';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TonApiTxDataByBocResp } from 'src/core/blockchain/models/ton/tonapi-types';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { TonApiService } from 'src/core/blockchain/services/ton/tonapi-service';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';

import { ContractMulticallResponse } from '../models/contract-multicall-response';
import { SupportedTokenField } from '../models/supported-token-field';
import { TX_STATUS, TxStatus } from '../models/tx-status';
import { Web3Public } from '../web3-public';

export class TonWeb3Public extends Web3Public {
    constructor() {
        super(BLOCKCHAIN_NAME.TON);
    }

    private readonly tonApi: TonApiService = new TonApiService();

    public async getTransactionStatus(txHash: string): Promise<TxStatus> {
        const isCompleted = await this.tonApi.checkIsTxCompleted(txHash);
        if (isCompleted) {
            return TX_STATUS.SUCCESS;
        }
        return TX_STATUS.PENDING;
    }

    public async getBlockchainTransaction(hash: string): Promise<TonApiTxDataByBocResp> {
        return this.tonApi.fetchTxInfo(hash);
    }

    public getBlockchainTransactionByMessageHash(hash: string): Promise<TonApiTxDataByBocResp> {
        return this.tonApi.fetchTxInfoByMessageHash(hash);
    }

    public async healthCheck(timeoutMs: number): Promise<boolean> {
        const isAlive = await pTimeout(this.tonApi.healthcheck(), timeoutMs, () => false);
        return isAlive;
    }

    public async getBalance(
        userAddress: string,
        tokenAddress?: string | undefined
    ): Promise<BigNumber> {
        const isNative = !tokenAddress || TonWeb3Pure.isNativeAddress(tokenAddress);
        const balance = isNative
            ? (await this.tonApi.fetchAccountInfo(userAddress)).balance
            : (await this.tonApi.fetchTokenInfoForWallet(userAddress, tokenAddress)).balance;
        return new BigNumber(balance || 0);
    }

    /**
     * @deprecated Use getBalance instead for all tokens and native currency
     */
    public async getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
        const info = await this.tonApi.fetchTokenInfoForWallet(userAddress, tokenAddress);
        return new BigNumber(info.balance || 0);
    }

    public async getTokensBalances(
        userAddress: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const tokensWithBalance = await this.tonApi.fetchAllNonNullableTokensInfoForWallet(
            userAddress
        );
        const nativeIndex = tokensAddresses.findIndex(TonWeb3Pure.isNativeAddress);

        if (!tokensWithBalance.length && nativeIndex === -1) {
            return [];
        }

        const balances = tokensAddresses
            .filter(address => !TonWeb3Pure.isNativeAddress(address))
            .map(address => {
                const tokenWithBalance = tokensWithBalance.find(
                    token =>
                        token.jetton.address.toLowerCase() ===
                        Address.parse(address).toRawString().toLowerCase()
                );
                if (tokenWithBalance) {
                    return new BigNumber(tokenWithBalance.balance);
                }
                return new BigNumber(0);
            });

        if (nativeIndex !== -1) {
            const acountInfo = await this.tonApi.fetchAccountInfo(userAddress);
            const nativeBalance = new BigNumber(acountInfo.balance);
            balances.splice(nativeIndex, 0, nativeBalance);
        }

        return balances;
    }

    public async callForTokensInfo(
        tokensAddresses: string[] | ReadonlyArray<string>,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>[]> {
        const info = await Promise.all(
            tokensAddresses.map(address => {
                if (TonWeb3Pure.isNativeAddress(address)) {
                    const nativeToken = nativeTokensStruct[BLOCKCHAIN_NAME.TON];
                    return nativeToken;
                }
                return this.tonApi.fetchTokenInfo(address);
            })
        );
        if (!info.length) {
            return [];
        }
        const necessaryInfo = info.map(token => {
            const tokenInfo = tokenFields.reduce(
                (acc, field) => ({ ...acc, [field]: token[field] }),
                {} as Partial<Record<SupportedTokenField, string>>
            );
            return tokenInfo;
        });

        return necessaryInfo;
    }

    public callContractMethod<T extends Web3PrimitiveType = string>(): Promise<T> {
        throw new Error('Method not implemented.');
    }

    public async getBlockNumber(): Promise<number> {
        try {
            const block = await this.tonApi.fetchLastBlockInfo();
            return block.seqno;
        } catch {
            return 0;
        }
    }

    public setProvider(): void {
        throw new Error('Method not implemented.');
    }

    public getAllowance(): Promise<BigNumber> {
        throw new Error('Method not implemented.');
    }

    public multicallContractsMethods<Output extends Web3PrimitiveType>(): Promise<
        ContractMulticallResponse<Output>[][]
    > {
        throw new Error('Method not implemented.');
    }
}
