/* eslint-disable unused-imports/no-unused-vars */
import { NxtpSdkBase, NxtpSdkUtils } from '@connext/nxtp-sdk';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount, PriceToken } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { createConnextConfig } from './constants/connext-config';
import { connextDomainId } from './constants/connext-domain-id';
import {
    ConnextCrossChainSupportedBlockchain,
    connextSupportedBlockchains
} from './constants/connext-supported-blockchains';

export class ConnextCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CONNEXT;

    private connextBaseSdk: NxtpSdkBase | undefined;

    public get connextBase(): NxtpSdkBase {
        return this.connextBaseSdk!;
    }

    private connextUtilsSdk: NxtpSdkUtils | undefined;

    public get connextUtils(): NxtpSdkUtils {
        return this.connextUtilsSdk!;
    }

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return connextSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        _from: PriceTokenAmount<EvmBlockchainName>,
        _toToken: PriceToken,
        _options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        if (!this.areSupportedBlockchains(_from.blockchain, _toToken.blockchain)) {
            return null;
        }

        const fromBlockchain = _from.blockchain as ConnextCrossChainSupportedBlockchain;
        const toBlockchain = _toToken.blockchain as ConnextCrossChainSupportedBlockchain;
        await this.createConnextSdk(_from.blockchain);

        try {
            console.info('>>>>>>>>>>>>>> CONNEXT <<<<<<<<<<<<<<');
            return null;
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    private async estimateRelayerFee(
        fromBlockchain: ConnextCrossChainSupportedBlockchain,
        toBlockchain: ConnextCrossChainSupportedBlockchain
    ): Promise<BigNumber> {
        const relayerFee = await this.connextBase.estimateRelayerFee({
            originDomain: connextDomainId[fromBlockchain].toString(),
            destinationDomain: connextDomainId[toBlockchain].toString()
        });

        return new BigNumber(`${relayerFee._hex}`);
    }

    public async createConnextSdk(fromBlockchain: EvmBlockchainName): Promise<void> {
        const walletAddress = this.getWalletAddress(fromBlockchain);
        const connextSdkConfig = createConnextConfig(walletAddress);

        if (!this.connextBaseSdk) {
            this.connextBaseSdk = await NxtpSdkBase.create(connextSdkConfig);
        }

        if (!this.connextUtilsSdk) {
            this.connextUtilsSdk = await NxtpSdkUtils.create(connextSdkConfig);
        }
    }

    public async checkMinMaxErrors(): Promise<void> {}
}
