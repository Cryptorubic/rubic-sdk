import BigNumber from 'bignumber.js';
import { Injector } from 'src/core/injector/injector';
import { AggregatorEvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';

export const getOnChainGasData: (
    trade: AggregatorEvmOnChainTrade,
    receiverAddress?: string
) => Promise<BigNumber | null> = async (
    trade: AggregatorEvmOnChainTrade,
    receiverAddress?: string
) => {
    const fromBlockchain = trade.from.blockchain;
    const walletAddress =
        Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
    if (!walletAddress) {
        return null;
    }

    try {
        const transactionConfig = await trade.encode({ fromAddress: walletAddress });

        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const gasLimit = (
            await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
        )[0];

        if (gasLimit?.isFinite()) {
            return gasLimit;
        }
    } catch {}
    try {
        const transactionData = await trade.getTxConfigAndCheckAmount({
            fromAddress: walletAddress,
            skipAmountCheck: true,
            useCacheData: true,
            receiverAddress: receiverAddress || walletAddress
        });

        if (transactionData.gas) {
            return new BigNumber(transactionData.gas);
        }
    } catch {}
    return null;
};
