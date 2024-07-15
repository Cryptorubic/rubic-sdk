import BigNumber from 'bignumber.js';
import pTimeout from 'src/common/utils/p-timeout';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { TonUtils } from 'src/core/blockchain/services/ton/ton-utils';
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

    public async getTransactionStatus(boc: string): Promise<TxStatus> {
        const isCompleted = await this.tonApi.checkIsTxCompleted(boc);
        if (isCompleted) {
            return TX_STATUS.SUCCESS;
        }
        return TX_STATUS.PENDING;
    }

    public async healthCheck(timeoutMs: number): Promise<boolean> {
        const fallback = () => false;
        const isAlive = await pTimeout(this.tonApi.healthcheck(), timeoutMs, fallback);
        return isAlive;
    }

    public async getBalance(
        userAddress: string,
        tokenAddress?: string | undefined
    ): Promise<BigNumber> {
        const isNative = !tokenAddress || TonWeb3Pure.isNativeAddress(tokenAddress);
        const balance = isNative
            ? (await this.tonApi.fetchAccountInfo(userAddress)).balance
            : await this.getTokenBalance(userAddress, tokenAddress);
        return new BigNumber(balance);
    }

    public async getTokenBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
        const info = await this.tonApi.fetchTokenInfoForWallet(userAddress, tokenAddress);
        return new BigNumber(info.balance || 0);
    }

    public async getTokensBalances(
        userAddress: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const tokens = await this.tonApi.fetchAllNonNullableTokensInfoForWallet(userAddress);
        if (!tokens.length || !tokensAddresses.length) {
            return [];
        }
        const rawTokensAddresses = await Promise.all(
            tokensAddresses.map(async address => {
                const res = await TonUtils.getAllFormatsOfAddress(address);
                return res.raw_form.toLowerCase();
            })
        );
        const balances = tokens
            .filter(token => rawTokensAddresses.includes(token.jetton.address.toLowerCase()))
            .map(token => new BigNumber(token.balance));

        return balances;
    }

    public async callForTokensInfo(
        tokensAddresses: string[] | ReadonlyArray<string>,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>[]> {
        const info = await Promise.all(
            tokensAddresses.map(address => this.tonApi.fetchTokenInfo(address))
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
