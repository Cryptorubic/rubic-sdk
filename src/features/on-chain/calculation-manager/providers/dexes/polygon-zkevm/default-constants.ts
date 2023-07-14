import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultPolygonZKEVMRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.POLYGON_ZKEVM]!.address, // WETH
    '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4', // DAI
    '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', // USDT
    '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035', // USDC
    '0x68286607A1d43602d880D349187c3c48c0fD05E6', // QUICK
    '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1' // wBTC
];

const defaultPolygonZKEVMWethAddress =
    wrappedNativeTokensList[BLOCKCHAIN_NAME.POLYGON_ZKEVM]!.address;

export const defaultPolygonZKEVMProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultPolygonZKEVMRoutingProvidersAddresses,
    wethAddress: defaultPolygonZKEVMWethAddress
};
