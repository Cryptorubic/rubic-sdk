import { ERC20_TOKEN_ABI } from '@core/blockchain/constants/erc-20-abi';
import { generateAccountsFromMnemonic } from '__tests__/utils/accounts-from-mnemonic';
import {
    publicProvidersRPC,
    publicProvidersSupportServerUrls
} from '__tests__/utils/configuration';
import { DEFAULT_MNEMONIC } from '__tests__/utils/constants/mnemonic';
import { TOKENS_HOLDERS } from '__tests__/utils/tokens';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, Configuration, Token } from 'src/core';
import * as util from 'util';
import Web3 from 'web3';
import { HttpProvider } from 'web3-core';

export class Chain {
    private static walletsNumber = 10;

    private static wallets = generateAccountsFromMnemonic(DEFAULT_MNEMONIC, Chain.walletsNumber);

    private static web3Instances = Object.fromEntries(
        Object.entries(publicProvidersRPC).map(([key, value]) => {
            const web3 = new Web3(value);
            Chain.wallets.forEach(wallet => {
                web3.eth.accounts.wallet.add(wallet.privateKey);
            });
            return [key, web3];
        })
    );

    private static get accounts(): string[] {
        return Chain.wallets.map(wallet => wallet.address);
    }

    public static async reset(
        blockchainName: BLOCKCHAIN_NAME,
        blockNumber?: number
    ): Promise<Chain> {
        const rpcUrl = publicProvidersRPC[blockchainName];
        const resetUrl = publicProvidersSupportServerUrls[blockchainName];

        if (!rpcUrl || !resetUrl) {
            throw new Error(`RPC for ${blockchainName} was not set.`);
        }
        await axios.post(resetUrl, { blockNumber });

        return new Chain(Chain.web3Instances[blockchainName], Chain.accounts);
    }

    private constructor(public web3: Web3, public accounts: string[]) {}

    public async getConfiguration(): Promise<Configuration> {
        const chainId = await this.web3.eth.getChainId();
        return {
            rpcProviders: Object.fromEntries(
                Object.entries(publicProvidersRPC).map(([key, value]) => [
                    key,
                    {
                        mainRpc: value
                    }
                ])
            ),
            walletProvider: {
                core: this.web3,
                chainId,
                address: this.accounts[0]
            }
        };
    }

    public async increaseTokensBalance(
        token: Token,
        amount: number | string | BigNumber,
        options: { inEtherUnits: boolean } = { inEtherUnits: false }
    ): Promise<void> {
        const weiAmount = options.inEtherUnits
            ? new BigNumber(amount).multipliedBy(10 ** token.decimals)
            : new BigNumber(amount);
        const holder = this.getTokenHolderAddress(token);
        await this.setBalance(holder, 1, {
            inEtherUnits: true
        });

        const tokenContract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, token.address);
        const holderBalance = new BigNumber(await tokenContract.methods.balanceOf(holder).call());
        if (holderBalance.lt(weiAmount)) {
            throw new Error(`${
                token.symbol
            } holder balance is not enough to transfer, set other holder to config.
             Holder balance is ${holderBalance.toFixed()}, but ${weiAmount.toFixed(
                0
            )} is required.`);
        }

        await this.impersonateAccount(holder);
        await tokenContract.methods
            .transfer(this.accounts[0], weiAmount.toFixed(0))
            .send({ from: holder, gas: 100_000 });
        await this.stopImpersonateAccount(holder);
    }

    private getTokenHolderAddress(token: Token): string {
        const holder =
            TOKENS_HOLDERS[token.blockchain as keyof typeof TOKENS_HOLDERS]?.[token.address];
        if (!holder) {
            throw new Error(`Holder for ${token.symbol} is not specified.`);
        }
        return holder;
    }

    public async impersonateAccount(address: string): Promise<void> {
        await this.sendRpcRequest('hardhat_impersonateAccount', [address]);
    }

    public async stopImpersonateAccount(address: string): Promise<void> {
        await this.sendRpcRequest('hardhat_stopImpersonatingAccount', [address]);
    }

    public async setBalance(
        address: string,
        value: number | string | BigNumber,
        options: { inEtherUnits: boolean } = { inEtherUnits: false }
    ): Promise<void> {
        const bnValue = options.inEtherUnits
            ? new BigNumber(value).multipliedBy(10 ** 18)
            : new BigNumber(value);

        const hexValue = `0x${bnValue.toString(16)}`;

        await this.sendRpcRequest('hardhat_setBalance', [address, hexValue]);
    }

    private async sendRpcRequest(method: string, params: string[]): Promise<void> {
        await util.promisify(
            (this.web3.currentProvider as HttpProvider).send.bind(this.web3.currentProvider)
        )({
            method,
            params,
            jsonrpc: '2.0',
            id: new Date().getTime()
        });
    }
}
