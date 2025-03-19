import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { DeflationTokenError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Cache } from 'src/common/utils/decorators';
import { notNull } from 'src/common/utils/object';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import {
    DeflationManagerSupportedBlockchain,
    deflationManagerSupportedBlockchains
} from 'src/features/deflation-token-manager/models/deflation-manager-supported-blockchain';
import { IsDeflationToken } from 'src/features/deflation-token-manager/models/is-deflation-token';
import { UniswapV2TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v2-trade-providers';

import { UniswapV2AbstractTrade } from '../on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { simulatorContractAbi } from './constants/simulator-contract-abi';
import { simulatorContractAddress } from './constants/simulator-contract-address';
import { customDeflationTokenList } from './models/custom-deflation-token-list';

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

        const deflationTokenList = customDeflationTokenList[evmToken.blockchain];

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
            if (typeof error?.data === 'string' && error?.data?.includes?.(ERROR_SELECTOR)) {
                return this.parseError(error.data);
            }
        }
        return { isDeflation: false };
    }

    private async findUniswapV2Trade(
        evmToken: Token<EvmBlockchainName>
    ): Promise<UniswapV2AbstractTrade | undefined> {
        const uniswapV2Providers = UniswapV2TradeProviders.map(ProviderClass => {
            const provider = new ProviderClass();
            return provider.blockchain === evmToken.blockchain ? provider : null;
        }).filter(notNull);

        const nativeToken = nativeTokensList[evmToken.blockchain] as Token<EvmBlockchainName>;
        const from = new PriceTokenAmount({
            ...nativeToken,
            price: new BigNumber(NaN),
            tokenAmount: new BigNumber(NATIVE_TOKEN_AMOUNT[evmToken.blockchain])
        });
        const to = new PriceToken({
            ...evmToken,
            price: new BigNumber(NaN)
        });

        const uniswapV2Trades = await Promise.allSettled(
            uniswapV2Providers.map(uniswapV2Provider =>
                uniswapV2Provider.calculate(from, to, {
                    slippageTolerance: 1,
                    deadlineMinutes: DEADLINE,
                    gasCalculation: 'disabled'
                })
            )
        );
        return uniswapV2Trades
            .map(trade => (trade.status === 'fulfilled' ? trade.value : null))
            .filter(notNull)[0];
    }

    private async simulateTransferWithSwap(
        uniswapV2Trade: UniswapV2AbstractTrade,
        token: TokenBaseStruct<EvmBlockchainName>
    ): Promise<void> {
        const { data } = await uniswapV2Trade.encodeDirect({
            fromAddress: SIMULATOR_CALLER,
            receiverAddress: simulatorContractAddress[token.blockchain],
            supportFee: true
        });

        const web3Public = Injector.web3PublicService.getWeb3Public(token.blockchain);
        const simulatorAddress = simulatorContractAddress[token.blockchain];
        const value = Web3Pure.toWei(NATIVE_TOKEN_AMOUNT[token.blockchain]);

        await web3Public.staticCallContractMethod(
            simulatorAddress,
            simulatorContractAbi,
            'simulateTransferWithSwap',
            [uniswapV2Trade.dexContractAddress, token.address, data],
            {
                value,
                from: SIMULATOR_CALLER
            }
        );
    }

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
