import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { convertGasDataToBN } from 'src/features/cross-chain/calculation-manager/utils/convert-gas-price';

export const getCrossChainGasData: (
    trade: EvmCrossChainTrade,
    receiverAddress?: string
) => Promise<GasData | null> = async (trade: EvmCrossChainTrade, receiverAddress?: string) => {
    try {
        const fromBlockchain = trade.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        const tx = await trade.encode({
            receiverAddress: receiverAddress,
            fromAddress: walletAddress
        });

        const [gasLimit, gasDetails] = await Promise.all([
            web3Public.getEstimatedGasByData(walletAddress, tx.to!, {
                data: tx.data!,
                value: String(tx.value)
            }),
            Injector.gasPriceApi.getGasPrice(fromBlockchain).then(gas => convertGasDataToBN(gas))
        ]);

        if (!gasLimit?.isFinite()) {
            return null;
        }

        const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);
        return {
            gasLimit: increasedGasLimit,
            ...gasDetails
        };
    } catch {
        return null;
    }
};
