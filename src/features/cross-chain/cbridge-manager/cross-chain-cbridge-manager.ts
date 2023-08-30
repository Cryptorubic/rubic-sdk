import BigNumber from 'bignumber.js';
import { compareAddresses } from 'src/common/utils/blockchain';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Injector } from 'src/core/injector/injector';
import { CbridgeCrossChainApiService } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-api-service';
import { cbridgeContractAbi } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-abi';
import { cbridgeContractAddress } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-address';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import {
    CbridgeStatusResponse,
    TRANSFER_HISTORY_STATUS
} from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-status-response';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';

export class CrossChainCbridgeManager {
    public static async getTransferId(
        sourceTransaction: string,
        fromBlockchain: CbridgeCrossChainSupportedBlockchain
    ): Promise<string> {
        const transactionRecipient = await Injector.web3PublicService
            .getWeb3Public(fromBlockchain)
            .getTransactionReceipt(sourceTransaction);
        const transferLog = transactionRecipient.logs.find(log =>
            compareAddresses(
                log.topics[0]!,
                '0x89d8051e597ab4178a863a5190407b98abfeff406aa8db90c59af76612e58f01'
            )
        )!;
        const abiCoder = new Web3().eth.abi;
        const inputs = cbridgeContractAbi.find(
            abiItem => abiItem?.type === 'event' && abiItem?.name === 'Send'
        )?.inputs;
        const decodedParams = abiCoder.decodeParameters(inputs!, transferLog.data);
        const { transferId } = decodedParams;
        if (transferId.includes('0x')) {
            return transferId.slice(2);
        }
        return transferId;
    }

    public static async makeRefund(
        fromBlockchain: CbridgeCrossChainSupportedBlockchain,
        sourceTransaction: string,
        estimateAmount: string,
        onTransactionHash: (hash: string) => void
    ): Promise<TransactionReceipt | null> {
        try {
            const useTestnet = BlockchainsInfo.isTestBlockchainName(fromBlockchain);

            const transferId = await CrossChainCbridgeManager.getTransferId(
                sourceTransaction,
                fromBlockchain
            );
            const statusResponse = await CbridgeCrossChainApiService.fetchTradeStatus(transferId, {
                useTestnet
            });
            if (statusResponse.status === TRANSFER_HISTORY_STATUS.TRANSFER_TO_BE_REFUNDED) {
                await CbridgeCrossChainApiService.withdrawLiquidity(transferId, estimateAmount, {
                    useTestnet
                });
                await new Promise(resolve => setTimeout(resolve, 10_000));
                return CrossChainCbridgeManager.transferRefund(
                    fromBlockchain,
                    statusResponse,
                    onTransactionHash
                );
            }
            if (statusResponse.status === TRANSFER_HISTORY_STATUS.TRANSFER_REFUND_TO_BE_CONFIRMED) {
                return CrossChainCbridgeManager.transferRefund(
                    fromBlockchain,
                    statusResponse,
                    onTransactionHash
                );
            }
            return null;
        } catch (err) {
            console.debug(err);
            return null;
        }
    }

    private static async transferRefund(
        fromBlockchain: CbridgeCrossChainSupportedBlockchain,
        statusResponse: CbridgeStatusResponse,
        onTransactionHash: (hash: string) => void
    ): Promise<TransactionReceipt> {
        const wdmsg = `0x${Buffer.from(statusResponse.wd_onchain!, 'base64').toString('hex')}`;
        const sigs = statusResponse.sorted_sigs.map(
            sign => `0x${Buffer.from(sign, 'base64').toString('hex')}`
        );
        const signers = statusResponse.signers.map(
            signer => `0x${Buffer.from(signer, 'base64').toString('hex')}`
        );
        const powers = statusResponse.powers.map(power => {
            const decodedPower = Buffer.from(power, 'base64').toString('hex');
            return new BigNumber(decodedPower, 16).toFixed();
        });

        return Injector.web3PrivateService
            .getWeb3Private(CHAIN_TYPE.EVM)
            .tryExecuteContractMethod(
                cbridgeContractAddress[fromBlockchain].providerRouter,
                cbridgeContractAbi,
                'withdraw',
                [wdmsg, sigs, signers, powers],
                {
                    onTransactionHash
                }
            );
    }
}
