import { NotSupportedBlockchain } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { OMNI_BRIDGE_ADDRESS_IN_ZETACHAIN } from './constants/eddy-bridge-contract-addresses';
import {
    EddyBridgeSupportedChain,
    eddyBridgeSupportedChains
} from './constants/eddy-bridge-supported-chains';
import { EDDY_BRIDGE_ABI } from './constants/omni-chain-abi';
import { EddyBridgeTrade } from './eddy-bridge-trade';

export class EddyBridgeProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.EDDY_BRIDGE;

    public isSupportedBlockchain(fromBlockchain: EvmBlockchainName): boolean {
        return eddyBridgeSupportedChains.some(chain => chain === fromBlockchain);
    }

    private skipkNotZetaSwapBridges(
        fromChain: EvmBlockchainName,
        toChain: EvmBlockchainName
    ): void {
        if (fromChain !== BLOCKCHAIN_NAME.ZETACHAIN && toChain !== BLOCKCHAIN_NAME.ZETACHAIN) {
            throw new NotSupportedBlockchain();
        }
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as EddyBridgeSupportedChain;
        const useProxy = options?.useProxy?.[this.type] ?? true;
        const walletAddress = this.getWalletAddress(fromBlockchain) || FAKE_WALLET_ADDRESS;
        try {
            checkUnsupportedReceiverAddress(
                options?.receiverAddress,
                options?.fromAddress || walletAddress
            );
            this.skipkNotZetaSwapBridges(from.blockchain, toToken.blockchain);

            const [eddyBridgeFee, feeInfo] = await Promise.all([
                this.getEddyBridgeFee(fromBlockchain),
                this.getFeeInfo(fromBlockchain, options.providerAddress, from, useProxy)
            ]);
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const to = await PriceTokenAmount.createToken({
                ...toToken.asStruct,
                tokenAmount: from.tokenAmount.minus(eddyBridgeFee)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await EddyBridgeTrade.getGasData({
                          feeInfo,
                          from: fromWithoutFee,
                          toToken: to,
                          providerAddress: options.providerAddress
                      })
                    : null;

            const trade = new EddyBridgeTrade({
                crossChainTrade: {
                    feeInfo,
                    from: fromWithoutFee,
                    gasData,
                    to,
                    priceImpact: from.calculatePriceImpactPercent(to)
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to)
            });

            return { trade, tradeType: this.type };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);
            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    private async getEddyBridgeFee(fromBlockchain: EddyBridgeSupportedChain): Promise<number> {
        const web3Public = this.getFromWeb3Public(fromBlockchain) as EvmWeb3Public;
        const platformFee = await web3Public.callContractMethod<number>(
            OMNI_BRIDGE_ADDRESS_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'platformFee',
            []
        );
        // @TODO check output format
        console.log('EDDY_PLATFORM_FEE ======> ', platformFee);
        return platformFee;
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }

    protected async getFeeInfo(
        fromBlockchain: EddyBridgeSupportedChain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }
}
