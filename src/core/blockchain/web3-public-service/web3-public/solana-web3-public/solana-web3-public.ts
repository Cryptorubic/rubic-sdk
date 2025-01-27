import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import {
    BlockhashWithExpiryBlockHeight,
    Connection,
    PublicKey,
    VersionedTransaction
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { base58 } from 'ethers/lib/utils';
import { catchError, firstValueFrom, from, map, of, timeout } from 'rxjs';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { NATIVE_SOLANA_MINT_ADDRESS } from 'src/core/blockchain/constants/solana/native-solana-mint-address';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ReturnValue } from 'src/core/blockchain/models/solana-web3-types';
import { Web3PrimitiveType } from 'src/core/blockchain/models/web3-primitive-type';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { SupportedTokenField } from 'src/core/blockchain/web3-public-service/web3-public/models/supported-token-field';
import {
    TX_STATUS,
    TxStatus
} from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/solana-web3-pure/solana-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { AbiItem } from 'web3-utils';

import { SolanaTokensService } from './services/solana-tokens-service';
/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export class SolanaWeb3Public extends Web3Public {
    private readonly HELIUS_API_URL = 'https://mainnet.helius-rpc.com';

    private readonly MAX_TRANSFER_COST = 10_000;

    constructor(private readonly connection: Connection) {
        super(BLOCKCHAIN_NAME.SOLANA);
    }

    /**
     * @returns ComputedUnitsLimit - like gasLimit in evm
     */
    public async getConsumedUnitsLimit(tx: VersionedTransaction): Promise<number> {
        const DEFAULT_CU_LIMIT = 600_000;
        try {
            const resp = await this.connection.simulateTransaction(tx, {
                replaceRecentBlockhash: true
            });
            return resp.value.unitsConsumed || DEFAULT_CU_LIMIT;
        } catch (err) {
            console.error('Solana_simulateTransaction_Error ==> ', err);
            return DEFAULT_CU_LIMIT;
        }
    }

    /**
     * @returns ComputedUnitsPrice - like gasPrice in evm
     */
    public async getConsumedUnitsPrice(tx: VersionedTransaction): Promise<number> {
        const resp = await Injector.httpClient.post<{ result: { priorityFeeEstimate: number } }>(
            `${this.HELIUS_API_URL}/?api-key=f6b96e37-e267-4b67-8790-84bdf8748c39`,
            {
                jsonrpc: '2.0',
                id: '1',
                method: 'getPriorityFeeEstimate',
                params: [
                    {
                        transaction: base58.encode(tx.serialize()), // Pass the serialized transaction in Base58
                        options: { priorityLevel: 'Medium' }
                    }
                ]
            }
        );

        return resp.result.priorityFeeEstimate;
    }

    public getBlockNumber(): Promise<number> {
        return this.connection.getBlockHeight('finalized');
    }

    public multicallContractsMethods<Output extends Web3PrimitiveType>(
        _contractAbi: AbiItem[],
        _contractsData: {
            contractAddress: string;
            methodsData: MethodData[];
        }[]
    ): Promise<ContractMulticallResponse<Output>[][]> {
        throw new Error('Method multicall is not supported');
    }

    public async getTransactionStatus(hash: string): Promise<TxStatus> {
        try {
            const transaction = await this.connection.getTransaction(hash, {
                maxSupportedTransactionVersion: 1
            });
            if (transaction?.meta?.err) {
                return TX_STATUS.FAIL;
            }
            if (transaction?.blockTime) {
                return TX_STATUS.SUCCESS;
            }
            return TX_STATUS.PENDING;
        } catch {
            return TX_STATUS.PENDING;
        }
    }

    public override async callForTokenInfo(
        tokenAddress: string,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name', 'image']
    ): Promise<Partial<Record<SupportedTokenField, string>>> {
        return (await this.callForTokensInfo([tokenAddress], tokenFields))[0]!;
    }

    public async callForTokensInfo(
        tokenAddresses: string[] | ReadonlyArray<string>,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name', 'image']
    ): Promise<Partial<Record<SupportedTokenField, string>>[]> {
        const nativeTokenIndex = tokenAddresses.findIndex(address =>
            this.Web3Pure.isNativeAddress(address)
        );
        const filteredTokenAddresses = tokenAddresses.filter(
            (_, index) => index !== nativeTokenIndex
        );

        const blockchainNativeToken = nativeTokensList[this.blockchainName];
        const nativeToken = {
            ...blockchainNativeToken,
            decimals: blockchainNativeToken.decimals.toString()
        };

        // only native token in array
        if (!filteredTokenAddresses.length && nativeTokenIndex !== -1) {
            return [nativeToken];
        }

        const mints = filteredTokenAddresses.map(address => new PublicKey(address));
        const tokensMint = await new SolanaTokensService(this.connection).fetchTokensData(mints);

        const tokens = tokensMint.map(token => {
            const data = tokenFields.reduce(
                (acc, fieldName) => ({
                    ...acc,
                    [fieldName]: fieldName === 'image' ? token.logoURI : token[fieldName]
                }),
                {} as Record<SupportedTokenField, string | undefined>
            );
            return data;
        });

        if (nativeTokenIndex === -1) {
            return tokens;
        }
        tokens.splice(nativeTokenIndex, 0, nativeToken);

        return tokens;
    }

    public async getBalance(userAddress: string, tokenAddress: string): Promise<BigNumber> {
        const isToken = tokenAddress && !SolanaWeb3Pure.isNativeAddress(tokenAddress);
        if (isToken) {
            const balance = await this.getTokensBalances(userAddress, [tokenAddress]);
            return balance?.[0] || new BigNumber(0);
        }
        const balance = await this.connection.getBalanceAndContext(
            new PublicKey(userAddress),
            'confirmed'
        );
        return new BigNumber(balance.value.toString());
    }

    public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
        const balance = await this.getTokensBalances(address, [tokenAddress]);
        return balance?.[0] || new BigNumber(0);
    }

    public async callContractMethod<T extends Web3PrimitiveType = string>(
        _contractAddress: string,
        _contractAbi: AbiItem[],
        _methodName: string,
        _methodArguments: unknown[] = [],
        _options: {
            from?: string;
            value?: string;
            gasPrice?: string;
            gas?: string;
        } = {}
    ): Promise<T> {
        throw new Error('Method call is not supported');
    }

    public healthCheck(timeoutMs: number = 4000): Promise<boolean> {
        const request = this.connection.getBalanceAndContext(
            new PublicKey('DVLwQbEaw5txuduQwvfbNP3sXvjawHqaoMuGMKZx15bQ'),
            'confirmed'
        );
        return firstValueFrom(
            from(request).pipe(
                timeout(timeoutMs),
                map(result => Boolean(result)),
                catchError((err: unknown) => {
                    if ((err as Error)?.name === 'TimeoutError') {
                        console.debug(
                            `Solana node healthcheck timeout (${timeoutMs}ms) has occurred.`
                        );
                    } else {
                        console.debug(`Solana node healthcheck fail: ${err}`);
                    }
                    return of(false);
                })
            )
        );
    }

    /**
     * Gets balance of multiple tokens.
     * @param address Wallet address.
     * @param tokensAddresses Tokens addresses.
     */
    public async getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]> {
        const resp = await (
            this.connection as Connection & {
                _rpcRequest: (owner: string, data: unknown[]) => ReturnValue;
            }
        )._rpcRequest('getTokenAccountsByOwner', [
            address,
            { programId: TOKEN_PROGRAM_ID },
            { encoding: 'jsonParsed' }
        ]);

        const tokenInfo = new Map<string, number>(
            resp.result.value.map(el => {
                const { mint, tokenAmount } = el.account.data.parsed.info;
                return [mint, tokenAmount.amount];
            })
        );

        const nativeSolBalance = await this.connection.getBalanceAndContext(
            new PublicKey(address),
            'confirmed'
        );
        return tokensAddresses.map(tokenAddress => {
            if (tokenAddress === NATIVE_SOLANA_MINT_ADDRESS) {
                return new BigNumber(nativeSolBalance.value.toString());
            }
            const tokenWithBalance = tokenInfo.get(tokenAddress);
            return new BigNumber(tokenWithBalance || NaN);
        });
    }

    public async getAllowance(): Promise<BigNumber> {
        return new BigNumber(Infinity);
    }

    public setProvider(_provider: unknown): void {
        return;
    }

    public async getRecentBlockhash(): Promise<BlockhashWithExpiryBlockHeight> {
        return this.connection.getLatestBlockhash();
    }

    public async getAtaAddress(
        walletAddress: string,
        tokenAddress: string
    ): Promise<string | null> {
        const tokenKey = new PublicKey(tokenAddress);
        const walletKey = new PublicKey(walletAddress);
        const ataAddress = await getAssociatedTokenAddress(
            tokenKey,
            walletKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const accountInfo = await this.connection.getAccountInfo(ataAddress);

        return accountInfo ? ataAddress.toString() : null;
    }
}
