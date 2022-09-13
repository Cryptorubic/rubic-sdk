import BigNumber from 'bignumber.js';
import { MULTICALL_ADDRESSES } from 'src/core/blockchain/web3-public-service/web3-public/constants/multicall-addresses';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

/**
 * Class containing methods for calling contracts in order to obtain information from the blockchain.
 * To send transaction or execute contract method use {@link Web3Private}.
 */
export abstract class Web3Public {
    protected readonly multicallAddress = MULTICALL_ADDRESSES[this.blockchainName];

    protected constructor(protected readonly blockchainName: BlockchainName) {}

    /**
     * Sets new provider to web3 instance.
     * @param provider New web3 provider, e.g. rpc link.
     */
    public abstract setProvider(provider: unknown): void;

    /**
     * Health-check current rpc node.
     * @param timeoutMs Acceptable node response timeout.
     * @returns Null if healthcheck is not defined for current blockchain, else node health status.
     */
    public abstract healthCheck(timeoutMs: number): Promise<boolean>;

    /**
     * Gets account native or token balance in wei.
     * @param address Wallet address, whose balance you want to find out.
     * @param tokenAddress Address of the smart-contract corresponding to the token,
     */
    public abstract getBalance(address: string, tokenAddress?: string): Promise<BigNumber>;

    /**
     * Gets token's balance in wei.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param address Wallet address, whose balance you want to find out.
     */
    public abstract getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber>;

    /**
     * Gets balances of multiple tokens via multicall.
     * @param address Wallet address, which contains tokens.
     * @param tokensAddresses Tokens addresses.
     */
    public abstract getTokensBalances(
        address: string,
        tokensAddresses: string[]
    ): Promise<BigNumber[]>;
}
