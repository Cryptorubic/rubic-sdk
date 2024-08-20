import { PriceTokenAmount } from 'src/common/tokens';
import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

import {
    CUSTODY_ADDRESSES,
    EDDY_OMNI_CONTRACT_IN_ZETACHAIN,
    EDDY_OMNI_CONTRACT_IN_ZETACHAIN_FOR_ANY_CHAIN,
    TSS_ADDRESSES_EDDY_BRIDGE
} from '../constants/eddy-bridge-contract-addresses';
import { TssAvailableEddyBridgeChain } from '../constants/eddy-bridge-supported-chains';
import { CUSTODY_ABI, EDDY_BRIDGE_ABI } from '../constants/edyy-bridge-abi';
import { EddyRoutingDirection, ERD } from './eddy-bridge-routing-directions';
import { findCompatibleZrc20TokenAddress } from './find-transit-token-address';

export class EddyBridgeEvmConfigFactory {
    private get wrappedZetaAddress(): string {
        return wrappedNativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN]!.address;
    }

    private readonly evmConfigBuilders: Map<EddyRoutingDirection, () => EvmEncodeConfig> = new Map([
        [ERD.ZETA_NATIVE_TO_ANY_CHAIN_ALL, this.createZetaNativeToAnyChainAllConfig],
        [ERD.ZETA_TOKEN_TO_ANY_CHAIN_ALL, this.createZetaTokenToAnyChainAllConfig],
        [ERD.ANY_CHAIN_NATIVE_TO_ZETA_NATIVE, this.createAnyChainNativeToZetaNativeConfig],
        [ERD.ANY_CHAIN_TOKEN_TO_ZETA_TOKEN, this.createAnyChainTokenToZetaTokenConfig],
        [ERD.ANY_CHAIN_NATIVE_TO_ZETA_TOKEN, this.createAnyChainNativeToZetaTokenConfig],
        [ERD.ANY_CHAIN_NATIVE_TO_ANY_CHAIN_TOKEN, this.createAnyChainNativeToAnyChainTokenConfig],
        [ERD.ANY_CHAIN_TOKEN_TO_ANY_CHAIN_TOKEN, this.createAnyChainTokenToAnyChainTokenConfig]
    ]);

    constructor(
        private readonly from: PriceTokenAmount<EvmBlockchainName>,
        private readonly to: PriceTokenAmount<EvmBlockchainName>,
        private readonly walletAddress: string,
        private readonly routingDirection: EddyRoutingDirection
    ) {}

    public getEvmConfig(): EvmEncodeConfig {
        const configBuilder = this.evmConfigBuilders.get(
            this.routingDirection
        ) as () => EvmEncodeConfig;
        const evmConfig = configBuilder.apply(this);

        return evmConfig;
    }

    private createAnyChainNativeToZetaNativeConfig(): EvmEncodeConfig {
        const data =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN +
            this.walletAddress.slice(2) +
            this.wrappedZetaAddress.slice(2);

        return {
            data,
            to: TSS_ADDRESSES_EDDY_BRIDGE[this.from.blockchain as TssAvailableEddyBridgeChain],
            value: this.from.stringWeiAmount
        };
    }

    private createAnyChainTokenToZetaTokenConfig(): EvmEncodeConfig {
        const msg =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN +
            this.walletAddress.slice(2) +
            this.to.address.slice(2);

        const methodArgs = [this.walletAddress, this.from.address, this.from.stringWeiAmount, msg];
        const config = EvmWeb3Pure.encodeMethodCall(
            CUSTODY_ADDRESSES[this.from.blockchain]!,
            CUSTODY_ABI,
            'deposit',
            methodArgs,
            '0'
        );

        return config;
    }

    private createAnyChainNativeToZetaTokenConfig(): EvmEncodeConfig {
        const data =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN +
            this.walletAddress.slice(2) +
            this.to.address.slice(2);

        return {
            data,
            to: TSS_ADDRESSES_EDDY_BRIDGE[this.from.blockchain as TssAvailableEddyBridgeChain],
            value: this.from.stringWeiAmount
        };
    }

    private createAnyChainNativeToAnyChainTokenConfig(): EvmEncodeConfig {
        const slicedDestZrc20TokenAddress = findCompatibleZrc20TokenAddress(this.to).slice(2);
        const slicedWalletAddress = this.walletAddress.slice(2);

        const data =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN_FOR_ANY_CHAIN +
            slicedDestZrc20TokenAddress +
            slicedWalletAddress;

        return {
            data,
            to: TSS_ADDRESSES_EDDY_BRIDGE[this.from.blockchain as TssAvailableEddyBridgeChain],
            value: this.from.stringWeiAmount
        };
    }

    private createAnyChainTokenToAnyChainTokenConfig(): EvmEncodeConfig {
        const slicedWalletAddress = this.walletAddress.slice(2);
        const slicedSrcZrc20Address = findCompatibleZrc20TokenAddress(this.from).slice(2);
        const msg =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN_FOR_ANY_CHAIN +
            slicedSrcZrc20Address +
            slicedWalletAddress;

        const methodArgs = [this.walletAddress, this.from.address, this.from.stringWeiAmount, msg];
        const config = EvmWeb3Pure.encodeMethodCall(
            CUSTODY_ADDRESSES[this.from.blockchain]!,
            CUSTODY_ABI,
            'deposit',
            methodArgs,
            '0'
        );

        return config;
    }

    private createZetaTokenToAnyChainAllConfig(): EvmEncodeConfig {
        const srcZrc20TokenAddress = this.from.address;
        const destZrc20TokenAddress = findCompatibleZrc20TokenAddress(this.to);
        const methodArgs = [
            '0x',
            this.from.stringWeiAmount,
            srcZrc20TokenAddress,
            destZrc20TokenAddress
        ];
        const config = EvmWeb3Pure.encodeMethodCall(
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'withdrawToNativeChain',
            methodArgs,
            '0'
        );

        return config;
    }

    private createZetaNativeToAnyChainAllConfig(): EvmEncodeConfig {
        const destZrc20TokenAddress = findCompatibleZrc20TokenAddress(this.to);
        const config = EvmWeb3Pure.encodeMethodCall(
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'transferZetaToConnectedChain',
            ['0x', this.wrappedZetaAddress, destZrc20TokenAddress],
            this.from.stringWeiAmount
        );

        return config;
    }
}
