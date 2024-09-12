import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { QuoteRequest } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/models/eddy-bridge-api-types';
import { EddyBridgeApiService } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/services/eddy-bridge-api-service';
import { EddyBridgeContractService } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/services/eddy-bridge-contract-service';
import { EddyQuoterControllerFactory } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/utils/eddy-quoter-controller-factory';
import { findApiTokenAddress } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/utils/find-api-token-address';

export const calculateRates = async (
    from: PriceTokenAmount<EvmBlockchainName>,
    toToken: PriceToken<EvmBlockchainName>,
    slippage: number
): Promise<string> => {
    try {
        const zrcFrom = findApiTokenAddress(from);
        const zrcTo = findApiTokenAddress(toToken);
        const fromChainId = blockchainId[from.blockchain];
        const toChainId = blockchainId[toToken.blockchain];

        const quoteParams: QuoteRequest = {
            fromAmount: from.stringWeiAmount,
            fromChainId: fromChainId,
            fromToken: zrcFrom,
            toChainId: toChainId,
            toToken: zrcTo
        };
        const rates = await EddyBridgeApiService.fetchRates(quoteParams);
        return rates.outputAmount;
    } catch {
        const [eddyFee, gasFeeInSrcTokenUnits] = await Promise.all([
            EddyBridgeContractService.getPlatformFee(),
            EddyBridgeContractService.getGasFeeInDestChain(from, toToken)
        ]);
        const ratioToAmount = 1 - eddyFee;

        const toAmount = await EddyQuoterControllerFactory.createController(
            from,
            toToken,
            ratioToAmount,
            gasFeeInSrcTokenUnits,
            slippage
        ).calculateToAmount();

        return Web3Pure.toWei(toAmount, toToken.decimals);
    }
};
