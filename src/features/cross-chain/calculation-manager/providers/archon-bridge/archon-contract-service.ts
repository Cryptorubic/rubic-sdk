import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Injector } from 'src/core/injector/injector';
import { archonBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-abi';
import { archonBridgeOutContractAddress } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-out-contract-address';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

export class ArchonContractService {
    public static async fetchDepositFeeBps(
        blockchainFrom: ArchonBridgeSupportedBlockchain,
        blockchainTo: ArchonBridgeSupportedBlockchain
    ): Promise<number> {
        const { web3, contractAddress } = ArchonContractService.getWeb3AndAddress(
            blockchainFrom,
            blockchainTo
        );

        const fee = await web3.callContractMethod(
            contractAddress.providerRouter,
            archonBridgeAbi,
            'depositFeeBps',
            []
        );

        return new BigNumber(fee).dividedBy(10000).toNumber();
    }

    public static async fetchLayerZeroFee(
        blockchainFrom: ArchonBridgeSupportedBlockchain,
        blockchainTo: ArchonBridgeSupportedBlockchain
    ): Promise<string> {
        const { web3, contractAddress } = ArchonContractService.getWeb3AndAddress(
            blockchainFrom,
            blockchainTo
        );

        return web3.callContractMethod(
            contractAddress.providerRouter,
            archonBridgeAbi,
            'estimateBridgeFee',
            [false, '0x']
        );
    }

    public static async checkSupportedToken(
        blockchainFrom: ArchonBridgeSupportedBlockchain,
        blockchainTo: ArchonBridgeSupportedBlockchain,
        tokenAddress: string
    ): Promise<boolean> {
        const { web3, contractAddress } = ArchonContractService.getWeb3AndAddress(
            blockchainFrom,
            blockchainTo
        );

        return web3.callContractMethod(
            contractAddress.providerRouter,
            archonBridgeAbi,
            'supportedTokens',
            [tokenAddress]
        );
    }

    public static getWeb3AndAddress(
        blockchainFrom: ArchonBridgeSupportedBlockchain,
        blockchainTo: ArchonBridgeSupportedBlockchain
    ): { web3: EvmWeb3Public; contractAddress: UniversalContract } {
        const web3 = Injector.web3PublicService.getWeb3Public(blockchainFrom);
        const contractAddress =
            blockchainFrom === BLOCKCHAIN_NAME.HORIZEN_EON
                ? archonBridgeOutContractAddress[
                      blockchainTo as Exclude<
                          ArchonBridgeSupportedBlockchain,
                          typeof BLOCKCHAIN_NAME.HORIZEN_EON
                      >
                  ]
                : archonBridgeOutContractAddress[blockchainFrom];

        return { web3, contractAddress };
    }
}
