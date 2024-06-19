import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { DRAGON_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/DRAGON_SWAP_METHOD';
import { ExactInputOutputSwapMethodsList } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    DRAGON_SWAP_CONTRACT_ABI,
    DRAGON_SWAP_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/sei/dragonswap/constants';
import { AbiItem } from 'web3-utils';

export class DragonSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.DRAGON_SWAP;
    }

    public readonly dexContractAddress = DRAGON_SWAP_CONTRACT_ADDRESS;

    public static readonly swapMethods: ExactInputOutputSwapMethodsList = DRAGON_SWAP_METHOD;

    public static readonly contractAbi: AbiItem[] = DRAGON_SWAP_CONTRACT_ABI;

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
