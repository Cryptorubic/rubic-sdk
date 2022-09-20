import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { BridgersSwapRequest } from 'src/features/cross-chain/providers/bridgers-trade-provider/models/bridgers-swap-request';
import { toBridgersBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/to-bridgers-blockchain';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/evm-bridgers-trade/models/evm-bridgers-transaction-data';
import { TronBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/tron-bridgers-trade/models/tron-bridgers-transaction-data';
import { Injector } from 'src/core/injector/injector';
import { PriceTokenAmount } from 'src/common/tokens';
import { MarkRequired } from 'ts-essentials';
import { GetContractParamsOptions } from 'src/features/cross-chain/providers/common/models/get-contract-params-options';
import BigNumber from 'bignumber.js';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';
import { BridgersSwapResponse } from 'src/features/cross-chain/providers/bridgers-trade-provider/models/bridgers-swap-response';

export async function getMethodArgumentsAndTransactionData<
    T extends EvmBridgersTransactionData | TronBridgersTransactionData
>(
    from: PriceTokenAmount<BridgersCrossChainSupportedBlockchain>,
    to: PriceTokenAmount<BridgersCrossChainSupportedBlockchain>,
    toTokenAmountMin: BigNumber,
    walletAddress: string,
    options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
): Promise<{
    methodArguments: unknown[];
    transactionData: T;
}> {
    const amountOutMin = Web3Pure.toWei(toTokenAmountMin, to.decimals);
    const swapRequest: BridgersSwapRequest = {
        fromTokenAddress: from.address,
        toTokenAddress: to.address,
        fromAddress: options.fromAddress || walletAddress,
        toAddress: options.receiverAddress,
        fromTokenChain: toBridgersBlockchain[from.blockchain],
        toTokenChain: toBridgersBlockchain[to.blockchain],
        fromTokenAmount: from.stringWeiAmount,
        amountOutMin,
        equipmentNo: walletAddress.slice(0, 32),
        sourceFlag: 'widget'
    };

    const swapData = await Injector.httpClient.post<BridgersSwapResponse<T>>(
        'https://sswap.swft.pro/api/sswap/swap',
        swapRequest
    );
    const transactionData = swapData.data.txData;

    const methodArguments: unknown[] = [
        [
            from.address,
            from.weiAmount,
            blockchainId[to.blockchain],
            to.address,
            amountOutMin,
            options.receiverAddress,
            EvmWeb3Pure.nativeTokenAddress,
            transactionData.to
        ]
    ];
    if (!from.isNative) {
        methodArguments.push(transactionData.to);
    }

    return {
        methodArguments,
        transactionData
    };
}
