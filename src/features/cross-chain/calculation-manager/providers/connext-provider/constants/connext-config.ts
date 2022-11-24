import { NxtpSdkConfig } from '@connext/nxtp-sdk';

export const createConnextConfig = (signerAddress: string): NxtpSdkConfig => {
    return {
        logLevel: 'info',
        signerAddress,
        environment: 'production',
        network: 'mainnet',
        chains: {
            '1735353714': {
                providers: ['https://goerli.infura.io/v3/19d34e1e01f849b482a6586994f60293'],
                assets: [
                    {
                        name: 'TEST',
                        symbol: 'TEST',
                        address: '0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1'
                    }
                ]
            },
            '9991': {
                providers: ['https://rpc-mumbai.matic.today'],
                assets: [
                    {
                        name: 'TEST',
                        symbol: 'TEST',
                        address: '0xeDb95D8037f769B72AAab41deeC92903A98C9E16'
                    }
                ]
            }
        }
    };
};
