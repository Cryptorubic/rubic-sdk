import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN } from '../constants/eddy-bridge-contract-addresses';
import { EDDY_BRIDGE_ABI } from '../constants/edyy-bridge-abi';
import { ZRC_20_ABI } from '../constants/zrc-20-token-abi';

export class EddyBridgeContractService {
    private static web3Public: EvmWeb3Public;

    constructor() {
        EddyBridgeContractService.web3Public = Injector.web3PublicService.getWeb3Public(
            BLOCKCHAIN_NAME.ZETACHAIN
        );
    }

    public static getPlatformFee(): Promise<number> {
        return this.web3Public.callContractMethod<number>(
            EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'platformFee',
            []
        );
    }

    public static async getGasInTargetChain(
        from: PriceTokenAmount<EvmBlockchainName>
    ): Promise<BigNumber> {
        const gasFeeInTargetChainWei = await this.web3Public.callContractMethod<[string, string]>(
            from.address,
            ZRC_20_ABI,
            'withdrawGasFee',
            []
        );
        const gasFeeNonWei = Web3Pure.fromWei(gasFeeInTargetChainWei?.[1], from.decimals);

        return gasFeeNonWei;
    }

    public static async getEddySlipage(): Promise<number> {
        return this.web3Public.callContractMethod<number>(
            EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'slippage',
            []
        );
    }
}
