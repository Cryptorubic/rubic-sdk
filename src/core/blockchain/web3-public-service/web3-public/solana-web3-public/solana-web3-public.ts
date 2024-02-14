import { BlockhashWithExpiryBlockHeight, Connection, PublicKey } from '@solana/web3.js';
import { Client as TokenSdk } from '@solflare-wallet/utl-sdk';
import BigNumber from 'bignumber.js';
import { catchError, firstValueFrom, from, map, of, timeout } from 'rxjs';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Cache } from 'src/common/utils/decorators';
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
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/solana-web3-pure';
import { AbiItem } from 'web3-utils';

/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export class SolanaWeb3Public extends Web3Public {
    constructor(private readonly connection: Connection) {
        super(BLOCKCHAIN_NAME.SOLANA);
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

    @Cache
    public async callForTokensInfo(
        tokenAddresses: string[] | ReadonlyArray<string>,
        tokenFields: SupportedTokenField[] = ['decimals', 'symbol', 'name']
    ): Promise<Partial<Record<SupportedTokenField, string>>[]> {
        const nativeTokenIndex = tokenAddresses.findIndex(address =>
            this.Web3Pure.isNativeAddress(address)
        );
        const filteredTokenAddresses = tokenAddresses.filter(
            (_, index) => index !== nativeTokenIndex
        );

        const mints = filteredTokenAddresses.map(address => new PublicKey(address));
        const tokenSdk = new TokenSdk();
        const tokensMint = await tokenSdk.fetchMints(mints);

        const tokens = tokensMint.map(token => {
            const entries = tokenFields.map(field => [field, token?.[field]]);
            return Object.fromEntries(entries);
        });

        if (nativeTokenIndex === -1) {
            return tokens;
        }

        const blockchainNativeToken = nativeTokensList[this.blockchainName];
        const nativeToken = {
            ...blockchainNativeToken,
            decimals: blockchainNativeToken.decimals.toString()
        };
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
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
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
}
