import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { DeflationTokenError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Cache } from 'src/common/utils/decorators';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import {
    DeflationManagerSupportedBlockchain,
    deflationManagerSupportedBlockchains
} from 'src/features/deflation-token-manager/models/deflation-manager-supported-blockchain';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';

import { customDeflationTokeList } from './models/custom-deflation-token-list';

const DEADLINE = 9999999999;
const SIMULATOR_CALLER = '0x0000000000000000000000000000000000000001';
const ERROR_SELECTOR = '0x02f19474';

const NATIVE_TOKEN_AMOUNT: Record<EvmBlockchainName, number> = Object.values(
    EVM_BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let tokenAmount = 0.5;
    if (blockchain === BLOCKCHAIN_NAME.POLYGON || blockchain === BLOCKCHAIN_NAME.AVALANCHE) {
        tokenAmount = 10;
    } else if (blockchain === BLOCKCHAIN_NAME.FANTOM) {
        tokenAmount = 230;
    }
    return {
        ...acc,
        [blockchain]: tokenAmount
    };
}, {} as Record<EvmBlockchainName, number>);

/**
 * Contains method to check token for deflation.
 */
export class DeflationTokenManager {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is DeflationManagerSupportedBlockchain {
        return deflationManagerSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async checkToken(token: Token): Promise<void | never> {
        const isDeflationToken = await this.isDeflationToken(token);
        if (isDeflationToken.isDeflation) {
            throw new DeflationTokenError(token, isDeflationToken.percent);
        }
    }

    @Cache
    public async isDeflationToken(token: Token): Promise<IsDeflationToken> {
        if (
            !DeflationTokenManager.isSupportedBlockchain(token.blockchain) ||
            EvmWeb3Pure.isNativeAddress(token.address)
        ) {
            return { isDeflation: false };
        }
        const evmToken = new Token({
            ...token,
            blockchain: token.blockchain as EvmBlockchainName
        });

        const deflationTokenList = customDeflationTokeList[evmToken.blockchain];

        if (
            deflationTokenList &&
            deflationTokenList.some(tokenAddress =>
                compareAddresses(tokenAddress, evmToken.address)
            )
        ) {
            return { isDeflation: true, isWhitelisted: true, percent: new BigNumber(0) };
        }

        const bestTrade = await this.findUniswapV2Trade(evmToken);
        if (!bestTrade) {
            return { isDeflation: false };
        }

        try {
            await this.simulateTransferWithSwap(bestTrade, evmToken);
        } catch (error) {
            if (error?.data?.includes(ERROR_SELECTOR)) {
                return this.parseError(error.data);
            }
        }
        return { isDeflation: false };
    }

    private async findUniswapV2Trade(_evmToken: Token<EvmBlockchainName>): Promise<undefined> {
        // @TODO API
        return undefined;
    }

    private async simulateTransferWithSwap(
        _uniswapV2Trade: unknown,
        _token: TokenBaseStruct<EvmBlockchainName>
    ): Promise<void> {}

    private parseError(errorData: string): IsDeflationToken {
        const decoded = EvmWeb3Pure.decodeData<{
            isWhitelisted: boolean;
            amountReceived: EthersBigNumber;
            amountExpected: EthersBigNumber;
        }>(
            'AmntReceived_AmntExpected_TransferSwap',
            [
                ['bool', 'isWhitelisted'],
                ['uint256', 'amountReceived'],
                ['uint256', 'amountExpected']
            ],
            errorData
        );

        const received = new BigNumber(decoded.amountReceived.toHexString());
        const expected = new BigNumber(decoded.amountExpected.toHexString());
        const percent = new BigNumber(1).minus(received.dividedBy(expected)).multipliedBy(100);

        if (percent.eq(0)) {
            return { isDeflation: false };
        }
        return {
            isDeflation: true,
            percent,
            isWhitelisted: decoded.isWhitelisted
        };
    }
}
