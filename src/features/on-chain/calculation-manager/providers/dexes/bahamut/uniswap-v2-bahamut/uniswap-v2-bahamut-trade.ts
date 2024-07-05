import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { UNISWAP_V2_BAHAMUT_CONTRACT_ADDRESS } from './constants';

export class UniswapV2BahamutTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.UNISWAP_BAHAMUT;
    }

    public readonly dexContractAddress = UNISWAP_V2_BAHAMUT_CONTRACT_ADDRESS;

    public async encode(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        if (this.useProxy) {
            return this.encodeProxy(options);
        }
        return this.encodeDirect(options);
    }
}
