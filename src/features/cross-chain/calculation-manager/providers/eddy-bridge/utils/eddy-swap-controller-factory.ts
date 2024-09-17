import { PriceTokenAmount } from 'src/common/tokens';
import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EddySwapController } from 'src/features/cross-chain/calculation-manager/providers/eddy-bridge/models/eddy-swap-controller';

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

export class EddySwapControllerFactory {
    private static readonly wrappedZetaAddress =
        wrappedNativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN]!.address;

    private static readonly evmConfigBuilders = {
        [ERD.ZETA_NATIVE_TO_ANY_CHAIN_ALL]:
            EddySwapControllerFactory.createZetaNativeToAnyChainAllConfig,
        [ERD.ZETA_TOKEN_TO_ANY_CHAIN_ALL]:
            EddySwapControllerFactory.createZetaTokenToAnyChainAllConfig,
        [ERD.ANY_CHAIN_NATIVE_TO_ZETA_NATIVE]:
            EddySwapControllerFactory.createAnyChainNativeToZetaNativeConfig,
        [ERD.ANY_CHAIN_TOKEN_TO_ZETA_TOKEN]:
            EddySwapControllerFactory.createAnyChainTokenToZetaTokenConfig,
        [ERD.ANY_CHAIN_NATIVE_TO_ZETA_TOKEN]:
            EddySwapControllerFactory.createAnyChainNativeToZetaTokenConfig,
        [ERD.ANY_CHAIN_NATIVE_TO_ANY_CHAIN_TOKEN]:
            EddySwapControllerFactory.createAnyChainNativeToAnyChainTokenConfig,
        [ERD.ANY_CHAIN_TOKEN_TO_ANY_CHAIN_TOKEN]:
            EddySwapControllerFactory.createAnyChainTokenToAnyChainTokenConfig
    };

    private constructor() {}

    public static createController(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        walletAddress: string,
        routingDirection: EddyRoutingDirection
    ): EddySwapController {
        return {
            getEvmConfig: () =>
                EddySwapControllerFactory.evmConfigBuilders[routingDirection](
                    from,
                    to,
                    walletAddress
                )
        };
    }

    private static createAnyChainNativeToZetaNativeConfig(
        from: PriceTokenAmount<EvmBlockchainName>,
        _to: PriceTokenAmount<EvmBlockchainName>,
        walletAddress: string
    ): EvmEncodeConfig {
        const data =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN +
            walletAddress.slice(2) +
            EddySwapControllerFactory.wrappedZetaAddress.slice(2);

        return {
            data,
            to: TSS_ADDRESSES_EDDY_BRIDGE[from.blockchain as TssAvailableEddyBridgeChain],
            value: from.stringWeiAmount
        };
    }

    private static createAnyChainTokenToZetaTokenConfig(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        walletAddress: string
    ): EvmEncodeConfig {
        const msg = EDDY_OMNI_CONTRACT_IN_ZETACHAIN + walletAddress.slice(2) + to.address.slice(2);

        const methodArgs = [walletAddress, from.address, from.stringWeiAmount, msg];
        const config = EvmWeb3Pure.encodeMethodCall(
            CUSTODY_ADDRESSES[from.blockchain]!,
            CUSTODY_ABI,
            'deposit',
            methodArgs,
            '0'
        );

        return config;
    }

    private static createAnyChainNativeToZetaTokenConfig(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        walletAddress: string
    ): EvmEncodeConfig {
        const data = EDDY_OMNI_CONTRACT_IN_ZETACHAIN + walletAddress.slice(2) + to.address.slice(2);

        return {
            data,
            to: TSS_ADDRESSES_EDDY_BRIDGE[from.blockchain as TssAvailableEddyBridgeChain],
            value: from.stringWeiAmount
        };
    }

    private static createAnyChainNativeToAnyChainTokenConfig(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        walletAddress: string
    ): EvmEncodeConfig {
        const slicedDestZrc20TokenAddress = findCompatibleZrc20TokenAddress(to).slice(2);
        const slicedWalletAddress = walletAddress.slice(2);

        const data =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN_FOR_ANY_CHAIN +
            slicedDestZrc20TokenAddress +
            slicedWalletAddress;

        return {
            data,
            to: TSS_ADDRESSES_EDDY_BRIDGE[from.blockchain as TssAvailableEddyBridgeChain],
            value: from.stringWeiAmount
        };
    }

    private static createAnyChainTokenToAnyChainTokenConfig(
        from: PriceTokenAmount<EvmBlockchainName>,
        _to: PriceTokenAmount<EvmBlockchainName>,
        walletAddress: string
    ): EvmEncodeConfig {
        const slicedWalletAddress = walletAddress.slice(2);
        const slicedSrcZrc20Address = findCompatibleZrc20TokenAddress(from).slice(2);
        const msg =
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN_FOR_ANY_CHAIN +
            slicedSrcZrc20Address +
            slicedWalletAddress;

        const methodArgs = [walletAddress, from.address, from.stringWeiAmount, msg];
        const config = EvmWeb3Pure.encodeMethodCall(
            CUSTODY_ADDRESSES[from.blockchain]!,
            CUSTODY_ABI,
            'deposit',
            methodArgs,
            '0'
        );

        return config;
    }

    private static createZetaTokenToAnyChainAllConfig(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        _walletAddress: string
    ): EvmEncodeConfig {
        const srcZrc20TokenAddress = from.address;
        const destZrc20TokenAddress = findCompatibleZrc20TokenAddress(to);
        const methodArgs = [
            '0x',
            from.stringWeiAmount,
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

    private static createZetaNativeToAnyChainAllConfig(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        _walletAddress: string
    ): EvmEncodeConfig {
        const destZrc20TokenAddress = findCompatibleZrc20TokenAddress(to);
        const config = EvmWeb3Pure.encodeMethodCall(
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'transferZetaToConnectedChain',
            ['0x', EddySwapControllerFactory.wrappedZetaAddress, destZrc20TokenAddress],
            from.stringWeiAmount
        );

        return config;
    }
}
