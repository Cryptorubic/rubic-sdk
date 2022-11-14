import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { DeflationTokenError } from 'src/common/errors';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { TokenBaseStruct } from 'src/common/tokens/models/token-base-struct';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { UniswapV2TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v2-trade-providers';
import { notNull } from 'src/common/utils/object';
import { UniswapV2AbstractTrade } from '../on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { simulatorContractAbi } from './constants/simulator-contract-abi';
import { simulatorContractAddress } from './constants/simulator-contract-address';

const DEADLINE = 9999999999;
const SIMULATOR_CALLER = '0x0000000000000000000000000000000000000001';
const ERROR_SELECTOR = '0x02f19474';
const NATIVE_TOKEN_AMOUNT = 250;

/**
 * Contains method to check token for deflation.
 */
export class DeflationTokenManager {
    public async checkToken(token: Token): Promise<void | never> {
        if (
            !BlockchainsInfo.isEvmBlockchainName(token.blockchain) ||
            EvmWeb3Pure.isNativeAddress(token.address)
        ) {
            return;
        }
        const evmToken = new Token({
            ...token,
            blockchain: token.blockchain as EvmBlockchainName
        });

        const bestTrade = await this.findUniswapV2Trade(evmToken);
        if (!bestTrade) {
            return;
        }

        try {
            await this.simulateTransferWithSwap(bestTrade, evmToken);
        } catch (error) {
            if (error?.data?.includes(ERROR_SELECTOR)) {
                this.parseError(error.data, evmToken);
            }
        }
    }

    private async findUniswapV2Trade(
        evmToken: Token<EvmBlockchainName>
    ): Promise<UniswapV2AbstractTrade | undefined> {
        const uniswapV2Providers = UniswapV2TradeProviders.map(ProviderClass => {
            const provider = new ProviderClass();
            return provider.blockchain === evmToken.blockchain ? provider : null;
        }).filter(notNull);

        const nativeToken = nativeTokensList[evmToken.blockchain];
        const from = new PriceTokenAmount({
            ...nativeToken,
            price: new BigNumber(NaN),
            tokenAmount: new BigNumber(NATIVE_TOKEN_AMOUNT)
        });
        const to = new PriceToken({
            ...evmToken,
            price: new BigNumber(NaN)
        });

        const uniswapV2Trades = await Promise.all(
            uniswapV2Providers.map(uniswapV2Provider =>
                uniswapV2Provider.calculate(from, to, {
                    slippageTolerance: 1,
                    deadlineMinutes: DEADLINE,
                    gasCalculation: 'disabled'
                })
            )
        );
        return uniswapV2Trades.filter(trade => !('error' in trade))[0];
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
        const value = Web3Pure.toWei(NATIVE_TOKEN_AMOUNT);

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

    private parseError(errorData: string, evmToken: Token<EvmBlockchainName>): never | void {
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
        if (decoded.isWhitelisted) {
            return;
        }

        const received = new BigNumber(decoded.amountReceived.toHexString());
        const expected = new BigNumber(decoded.amountExpected.toHexString());
        const deflationPercent = new BigNumber(1)
            .minus(received.dividedBy(expected))
            .multipliedBy(100);

        if (deflationPercent.gt(0)) {
            throw new DeflationTokenError(evmToken, deflationPercent.toFixed(2));
        }
    }
}
