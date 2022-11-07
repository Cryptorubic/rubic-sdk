import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from 'ethers';
import { DeflationTokenError } from 'src/common/errors';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    BlockchainName,
    BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainManager } from 'src/features/on-chain/calculation-manager/on-chain-manager';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { defaultUniswapV2Abi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/uniswap-v2-abi';
import { LifiTrade } from 'src/features/on-chain/calculation-manager/providers/lifi/lifi-trade';
import {
    isAlgebraTrade,
    isUniswapV3LikeTrade
} from 'src/features/on-chain/calculation-manager/utils/type-guards';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';
import { CelerCrossChainSupportedBlockchain } from '../cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { OneinchTrade } from '../on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/oneinch-trade';
import { UniswapV2AbstractTrade } from '../on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { simulatorContractAbi } from './constants/simulator-contract-abi';
import { simulatorContractAddress } from './constants/simulator-contract-address';

const DEADLINE = 9999999999;
const SLIPPAGE_PERCENT = 50;
const SIMULATOR_CALLER = '0x0000000000000000000000000000000000000001';
const ERROR_SELECTOR = '0x336cc9a5';
const nativeTokenAmount: Record<CelerCrossChainSupportedBlockchain, number> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 0.3,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 0.5,
    [BLOCKCHAIN_NAME.POLYGON]: 10,
    [BLOCKCHAIN_NAME.AVALANCHE]: 5,
    [BLOCKCHAIN_NAME.FANTOM]: 230,
    [BLOCKCHAIN_NAME.ARBITRUM]: 0.3,
    [BLOCKCHAIN_NAME.AURORA]: 0.3
};

/**
 * Contains method to check token for deflation.
 */
export class DeflationTokenManager {
    private readonly onChainManager = new OnChainManager({} as ProviderAddress);

    public async checkToken(token: {
        address: string;
        blockchain: BlockchainName;
        symbol: string;
    }): Promise<void> {
        const tokenBlockchain = token.blockchain as EvmBlockchainName;
        const tokenAddress = token.address;
        const nativeToken = nativeTokensList[token.blockchain];
        const nativeAmount =
            nativeTokenAmount[tokenBlockchain as CelerCrossChainSupportedBlockchain];
        const onChainTrades = await this.onChainManager.calculateTrade(
            { address: nativeToken.address, blockchain: nativeToken.blockchain },
            nativeAmount,
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
            )[0] as UniswapV2AbstractTrade;

        if (!bestTrade) {
            return;
        }

        try {
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
                Web3Pure.toWei(nativeAmount, nativeToken.decimals)
            );

            await this.simulateTransferWithSwap(
                bestTrade.contractAddress,
                { address: tokenAddress, blockchain: tokenBlockchain },
                data!,
                Web3Pure.toWei(nativeAmount, nativeToken.decimals)
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
        value: string
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
                    value,
                    from: SIMULATOR_CALLER
                }
            );
        } catch (e) {
            throw e;
        }
    }
}
