import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ChainType } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PublicService } from 'src/core/blockchain/web3-public-service/web3-public-service';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { wrappedAddress } from './constants/wrapped-addresses';

export type TokenStruct<T extends BlockchainName = BlockchainName> = {
    blockchain: T;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image?: string;
};

/**
 * Contains main token's fields.
 */
export class Token<T extends BlockchainName = BlockchainName> {
    /**
     * Creates Token based on token's address and blockchain.
     * @param tokenBaseStruct Base token structure.
     */
    public static async createToken<T extends BlockchainName = BlockchainName>(
        tokenBaseStruct: TokenBaseStruct<T>
    ): Promise<Token<T>> {
        if (tokenBaseStruct.blockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return nativeTokensList[BLOCKCHAIN_NAME.BITCOIN] as Token<T>;
        }
        if (tokenBaseStruct.blockchain === BLOCKCHAIN_NAME.ICP) {
            return nativeTokensList[BLOCKCHAIN_NAME.ICP] as Token<T>;
        }

        if (!Web3PublicService.isSupportedBlockchain(tokenBaseStruct.blockchain)) {
            throw new RubicSdkError(
                `${tokenBaseStruct.blockchain} blockchain is not supported in Token class`
            );
        }
        const web3Public = Injector.web3PublicService.getWeb3Public(tokenBaseStruct.blockchain);
        const tokenInfo = await web3Public.callForTokenInfo(tokenBaseStruct.address);

        if (
            tokenInfo.decimals === undefined ||
            tokenInfo.name === undefined ||
            tokenInfo.symbol === undefined
        ) {
            throw new RubicSdkError('Error while loading token');
        }

        return new Token({
            ...tokenBaseStruct,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            decimals: parseInt(tokenInfo.decimals),
            ...('image' in tokenInfo && { image: tokenInfo.image })
        });
    }

    /**
     * Creates array of Tokens based on tokens' addresses and blockchain.
     */
    public static async createTokens<T extends BlockchainName = BlockchainName>(
        tokensAddresses: string[] | ReadonlyArray<string>,
        blockchain: T
    ): Promise<Token<T>[]> {
        if (!Web3PublicService.isSupportedBlockchain(blockchain)) {
            throw new RubicSdkError(`${blockchain} blockchain is not supported in Token class`);
        }
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        const tokenInfo = await web3Public.callForTokensInfo(tokensAddresses);

        return tokenInfo.map((tokenInfo, index) => {
            if (
                tokenInfo.decimals === undefined ||
                tokenInfo.name === undefined ||
                tokenInfo.symbol === undefined
            ) {
                throw new RubicSdkError('Error while loading token');
            }

            const address = tokensAddresses?.[index];
            if (!address) {
                throw new RubicSdkError('Address has to be defined');
            }

            return new Token({
                address,
                blockchain,
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                decimals: parseInt(tokenInfo.decimals),
                ...('image' in tokenInfo && { image: tokenInfo.image })
            });
        });
    }

    /**
     * Maps provided tokens to their addresses.
     */
    public static tokensToAddresses(tokens: Token[]): string[] {
        return tokens.map(token => token.address);
    }

    public readonly blockchain: T;

    public readonly address: string;

    public readonly name: string;

    public readonly symbol: string;

    public readonly decimals: number;

    public readonly image: string | undefined;

    public get isNative(): boolean {
        const chainType: ChainType = BlockchainsInfo.getChainType(this.blockchain);

        if (chainType && Web3Pure[chainType].isNativeAddress(this.address)) {
            return Web3Pure[chainType].isNativeAddress(this.address);
        }

        return this.address === Web3Pure[chainType].nativeTokenAddress;
    }

    public get isWrapped(): boolean {
        const address = wrappedAddress[this.blockchain] as string;
        if (!address) {
            return false;
        }

        return compareAddresses(this.address, address);
    }

    constructor(tokenStruct: TokenStruct<T>) {
        this.blockchain = tokenStruct.blockchain;
        this.address = tokenStruct.address;
        this.name = tokenStruct.name;
        this.symbol = tokenStruct.symbol;
        this.decimals = tokenStruct.decimals;
        this.image = tokenStruct.image;
    }

    public isEqualTo(token: TokenBaseStruct): boolean {
        return (
            token.blockchain === this.blockchain && compareAddresses(token.address, this.address)
        );
    }

    public isEqualToTokens(tokens: TokenBaseStruct[]): boolean {
        return tokens.some(token => this.isEqualTo(token));
    }

    public clone(tokenStruct?: Partial<TokenStruct>): Token {
        return new Token({ ...this, ...tokenStruct });
    }
}
