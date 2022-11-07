import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/evm-bridgers-trade/models/evm-bridgers-transaction-data';
import { TronBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/tron-bridgers-trade/models/tron-bridgers-transaction-data';
import { Injector } from 'src/core/injector/injector';
import { PriceTokenAmount } from 'src/common/tokens';
import { MarkRequired } from 'ts-essentials';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import BigNumber from 'bignumber.js';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { createTokenNativeAddressProxy } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/token-native-address-proxy';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import {
    BridgersSwapRequest,
    BridgersSwapResponse
} from 'src/features/common/providers/bridgers/models/bridgers-swap-api';

export async function getMethodArgumentsAndTransactionData<
    T extends EvmBridgersTransactionData | TronBridgersTransactionData
>(
    fromWithoutFee: PriceTokenAmount<BridgersCrossChainSupportedBlockchain>,
    to: PriceTokenAmount<BridgersCrossChainSupportedBlockchain>,
    toTokenAmountMin: BigNumber,
    walletAddress: string,
    options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
): Promise<{
    methodArguments: unknown[];
    transactionData: T;
}> {
    const amountOutMin = Web3Pure.toWei(toTokenAmountMin, to.decimals);
    const fromTokenAddress = createTokenNativeAddressProxy(
        fromWithoutFee,
        bridgersNativeAddress
    ).address;
    const toTokenAddress = createTokenNativeAddressProxy(to, bridgersNativeAddress).address;
    const fromAddress = options.fromAddress || walletAddress;
    const swapRequest: BridgersSwapRequest = {
        fromTokenAddress,
        toTokenAddress,
        fromAddress,
        toAddress: options.receiverAddress,
        fromTokenChain: toBridgersBlockchain[fromWithoutFee.blockchain],
        toTokenChain: toBridgersBlockchain[to.blockchain],
        fromTokenAmount: fromWithoutFee.stringWeiAmount,
        amountOutMin,
        equipmentNo: fromAddress.slice(0, 32),
        sourceFlag: 'rubic'
    };

    const swapData = await Injector.httpClient.post<BridgersSwapResponse<T>>(
        'https://sswap.swft.pro/api/sswap/swap',
        swapRequest
    );
    const transactionData = swapData.data.txData;

    const dstTokenAddress = BlockchainsInfo.isTronBlockchainName(to.blockchain)
        ? TronWeb3Pure.addressToHex(to.address)
        : to.address;
    const receiverAddress = BlockchainsInfo.isTronBlockchainName(to.blockchain)
        ? TronWeb3Pure.addressToHex(options.receiverAddress)
        : options.receiverAddress;
    const methodArguments: unknown[] = [
        'native:bridgers',
        [
            fromWithoutFee.address,
            fromWithoutFee.stringWeiAmount,
            blockchainId[to.blockchain],
            dstTokenAddress,
            amountOutMin,
            receiverAddress,
            EvmWeb3Pure.nativeTokenAddress,
            transactionData.to
        ]
    ];
    if (!fromWithoutFee.isNative) {
        methodArguments.push(transactionData.to);
    }

    return {
        methodArguments,
        transactionData
    };
}
