/* eslint-disable no-console */
import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { DeflationTokenError } from 'src/common/errors';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainManager } from 'src/features/on-chain/calculation-manager/on-chain-manager';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/abstract/on-chain-trade/on-chain-trade';
import { defaultUniswapV2Abi } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/constants/uniswap-v2-abi';
import { LifiTrade } from 'src/features/on-chain/calculation-manager/providers/lifi/lifi-trade';
import {
    isAlgebraTrade,
    isOneInchLikeTrade,
    isUniswapV2LikeTrade,
    isUniswapV3LikeTrade
} from 'src/features/on-chain/calculation-manager/utils/type-guards';
import { OneinchTrade } from '../on-chain/calculation-manager/providers/dexes/abstract/oneinch-abstract/oneinch-trade';
import { simulatorContractAbi } from './constants/simulator-contract-abi';
import { simulatorContractAddress } from './constants/simulator-contract-address';

interface SimulatorCallArguments {
    dexAddress: string;
    checkToken: {
        address: string;
        blockchain: EvmBlockchainName;
    };
    data?: string;
    value?: string;
}

const DEADLINE = 9999999999; /// maximum deadline
const SLIPPAGE_PERCENT = 50; // 1inch maximum slippage value
const SIMULATOR_CALLER = '0x0000000000000000000000000000000000000001'; // address with native and wrap balance
const ERROR_SELECTOR = '0x336cc9a5'; // tracked error selector
// const NATIVE_AMOUNT_FOR_SWAP: Record<CelerCrossChainSupportedBlockchain, number> = {
//     [BLOCKCHAIN_NAME.]
// }

export class DeflationTokenManager {
    private readonly onChainManager = new OnChainManager();

    public async checkToken(token: {
        address: string;
        blockchain: BlockchainName;
        symbol: string;
    }): Promise<void> {
        let isDeflationToken = false;
        const tokenBlockchain = token.blockchain as EvmBlockchainName;
        const tokenAddress = token.address;
        const nativeToken = nativeTokensList[token.blockchain];
        const onChainTrades = await this.onChainManager.calculateTrade(
            { address: nativeToken.address, blockchain: nativeToken.blockchain },
            10,
            tokenAddress,
            { slippageTolerance: SLIPPAGE_PERCENT / 100, deadlineMinutes: DEADLINE }
        );
        const bestTrade = onChainTrades
            .filter(trade => !('error' in trade))
            .filter(
                trade =>
                    !isUniswapV3LikeTrade(trade as OnChainTrade) &&
                    !isAlgebraTrade(trade as OnChainTrade) &&
                    !(trade instanceof LifiTrade) &&
                    !(trade instanceof OneinchTrade)
            )[0] as OnChainTrade;

        console.log({ onChainTrades, bestTrade });
        if (!bestTrade) {
            return;
        }

        try {
            const simulatorCallArguments: SimulatorCallArguments = {
                dexAddress: bestTrade.contractAddress,
                checkToken: { address: tokenAddress, blockchain: tokenBlockchain }
            };

            if (isUniswapV2LikeTrade(bestTrade)) {
                const minReceiveAmount = 0;
                const args = [
                    minReceiveAmount,
                    bestTrade.wrappedPath.map(t => t.address),
                    simulatorContractAddress[tokenBlockchain],
                    DEADLINE
                ];
                const { data } = EvmWeb3Pure.encodeMethodCall(
                    bestTrade.contractAddress,
                    defaultUniswapV2Abi,
                    'swapExactETHForTokens',
                    args,
                    Web3Pure.toWei(10, 18)
                );

                simulatorCallArguments.data = data;

                console.log('UNISWAP V2 DATA', { args, data });
            }

            if (isUniswapV3LikeTrade(bestTrade)) {
                const { data, value } = await bestTrade.encode({
                    fromAddress: SIMULATOR_CALLER,
                    receiverAddress: simulatorContractAddress['POLYGON']
                });

                console.log('UNISWAP V3 DATA', { data, value });

                simulatorCallArguments.data = data;
                simulatorCallArguments.value = value as string;
            }

            if (isOneInchLikeTrade(bestTrade)) {
                const inchSwapResponse = await bestTrade.getTradeData(
                    true,
                    SIMULATOR_CALLER,
                    simulatorContractAddress['POLYGON']
                );

                console.log({ inchSwapResponse, bestTrade });

                simulatorCallArguments.data = inchSwapResponse.tx.data;
                simulatorCallArguments.value = inchSwapResponse.tx.value;
            }

            await this.simulateTransferWithSwap(
                simulatorCallArguments.dexAddress,
                simulatorCallArguments.checkToken,
                simulatorCallArguments.data!,
                simulatorCallArguments.value
            );
        } catch (error) {
            if (!error?.data?.includes(ERROR_SELECTOR)) {
                return;
            }

            if (error.data) {
                const decoded = EvmWeb3Pure.decodeData<{
                    amountReceived: EthersBigNumber;
                    amountExpected: EthersBigNumber;
                }>(
                    'AmntReceived_AmntExpected_TransferSwap',
                    [
                        ['uint256', 'amountReceived'],
                        ['uint256', 'amountExpected']
                    ],
                    error.data
                );
                const received = new BigNumber(decoded.amountReceived.toHexString());
                const expected = new BigNumber(decoded.amountExpected.toHexString());
                const deflationPercent = new BigNumber(1)
                    .minus(received.dividedBy(expected))
                    .multipliedBy(100);
                isDeflationToken = deflationPercent.gt(0);
                console.log({
                    data: error.data,
                    decodedData: decoded,
                    deflationPercent: deflationPercent.toString(),
                    isDeflationToken
                });
                if (deflationPercent.gt(0)) {
                    throw new DeflationTokenError(token.symbol, deflationPercent.toFixed(2));
                }
            }
        }
    }

    private async simulateTransferWithSwap(
        dexAddress: string,
        token: { address: string; blockchain: EvmBlockchainName },
        data: string,
        value?: string
    ): Promise<void> {
        const web3Public = Injector.web3PublicService.getWeb3Public(token.blockchain);
        const simulatorAddress = simulatorContractAddress[token.blockchain];

        // eslint-disable-next-line no-useless-catch
        try {
            await web3Public.staticCallContractMethod(
                simulatorAddress as string,
                simulatorContractAbi,
                'simulateTransferWithSwap',
                [dexAddress, token.address, data],
                {
                    value: value || Web3Pure.toWei(10, nativeTokensList[token.blockchain].decimals),
                    from: SIMULATOR_CALLER
                }
            );
        } catch (e) {
            throw e;
        }
    }
}
