import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TokenBaseStruct } from 'src/common/tokens-manager/models/token-base-struct';
import { Injector } from 'src/core/sdk/injector';
import { compareAddresses } from 'src/common/utils/blockchain';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';

export type TokenStruct = {
    blockchain: BlockchainName;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
};

/**
 * Contains main token's fields.
 */
export class Token {
    /**
     * Creates Token based on token's address and blockchain.
     * @param tokenBaseStruct Base token structure.
     */
    public static async createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token> {
        if (tokenBaseStruct.blockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return new Token({
                ...tokenBaseStruct,
                ...nativeTokensList[BLOCKCHAIN_NAME.BITCOIN]
            });
        }
        const web3Public = Injector.web3PublicService.getWeb3Public(tokenBaseStruct.blockchain);
        const tokenInfo = await web3Public.callForTokenInfo(tokenBaseStruct.address);

        if (tokenInfo.decimals == null || tokenInfo.name == null || tokenInfo.symbol == null) {
            throw new RubicSdkError('Error while loading token');
        }

        return new Token({
            ...tokenBaseStruct,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            decimals: parseInt(tokenInfo.decimals)
        });
    }

    /**
     * Creates array of Tokens based on tokens' addresses and blockchain.
     */
    public static async createTokens(
        tokensAddresses: string[] | ReadonlyArray<string>,
        blockchain: BlockchainName
    ): Promise<Token[]> {
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
                decimals: parseInt(tokenInfo.decimals)
            });
        });
    }

    /**
     * Maps provided tokens to their addresses.
     */
    public static tokensToAddresses(tokens: Token[]): string[] {
        return tokens.map(token => token.address);
    }

    public readonly blockchain: BlockchainName;

    public readonly address: string;

    public readonly name: string;

    public readonly symbol: string;

    public readonly decimals: number;

    public get isNative(): boolean {
        return EvmWeb3Pure.isNativeAddress(this.address);
    }

    constructor(tokenStruct: TokenStruct) {
        this.blockchain = tokenStruct.blockchain;
        this.address = tokenStruct.address;
        this.name = tokenStruct.name;
        this.symbol = tokenStruct.symbol;
        this.decimals = tokenStruct.decimals;
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
