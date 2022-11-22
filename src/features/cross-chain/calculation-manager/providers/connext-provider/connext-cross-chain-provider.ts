/* eslint-disable unused-imports/no-unused-vars */
import { NxtpSdkBase } from '@connext/nxtp-sdk';
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

    private connextSdk: NxtpSdkBase | undefined;

    public get connext(): NxtpSdkBase {
        return this.connextSdk!;
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

        try {
            console.info('>>>>>>>>>>>>>> CONNEXT <<<<<<<<<<<<<<');
            await this.createConnextSdk(_from.blockchain);
            const relayerFee = await this.estimateRelayerFee(fromBlockchain, toBlockchain);
            console.log({ relayerFee });
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
        const relayerFee = await this.connext.estimateRelayerFee({
            originDomain: connextDomainId[fromBlockchain].toString(),
            destinationDomain: connextDomainId[toBlockchain].toString()
        });

        return new BigNumber(`${relayerFee._hex}`);
    }

    public async createConnextSdk(fromBlockchain: EvmBlockchainName): Promise<void> {
        const walletAddress = this.getWalletAddress(fromBlockchain);
        const connextSdkConfig = createConnextConfig(walletAddress);
        this.connextSdk = await NxtpSdkBase.create(connextSdkConfig);
    }

    public async checkMinMaxErrors(): Promise<void> {}
}
